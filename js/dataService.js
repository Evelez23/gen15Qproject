(function () {
  const DATA_FILES = {
    validados: 'data/casos_validados.json',
    noValidados: 'data/casos_no_validados.json'
  };

  function toAbsolutePath(relativePath) {
    return new URL(relativePath, document.baseURI).toString();
  }

  async function fetchJson(relativePath) {
    const response = await fetch(toAbsolutePath(relativePath));
    if (!response.ok) {
      throw new Error(`No se pudo cargar ${relativePath}: ${response.status}`);
    }
    const payload = await response.json();
    if (Array.isArray(payload)) {
      return payload;
    }
    if (payload && Array.isArray(payload.data)) {
      return payload.data;
    }
    return [];
  }

  function normalizeString(value) {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\s+/g, ' ').trim();
  }

  function normalizeGender(value) {
    const normalized = normalizeString(value).toLowerCase();
    if (!normalized) return 'no especificado';
    if (normalized.startsWith('m') || normalized.includes('masc')) return 'masculino';
    if (normalized.startsWith('f') || normalized.includes('fem')) return 'femenino';
    return normalized;
  }

  function normalizeSeverity(value) {
    const normalized = normalizeString(value).toLowerCase();
    if (!normalized) return 'no especificado';
    if (normalized.includes('leve')) return 'leve';
    if (normalized.includes('moderad') || normalized.includes('apoyo')) return 'moderado';
    if (normalized.includes('grave') || normalized.includes('sever') || normalized.includes('dependencia')) return 'grave';
    if (normalized.includes('asintom')) return 'asintomático';
    return normalized;
  }

  function toNumber(value) {
    const text = normalizeString(value).replace(',', '.');
    const numeric = Number.parseFloat(text);
    return Number.isFinite(numeric) ? numeric : null;
  }

  function pick(obj, keys) {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined && obj[key] !== null && String(obj[key]).trim() !== '') {
        return obj[key];
      }
    }
    return '';
  }

  function splitSymptoms(symptoms) {
    const value = normalizeString(symptoms);
    if (!value) return [];
    return value.split(/[,;|]/).map(item => normalizeString(item)).filter(Boolean);
  }

  function validateCase(normalizedCase) {
    const errors = [];
    if (!normalizedCase.nombre) errors.push('missing_name');
    if (!normalizedCase.localizacion) errors.push('missing_location');
    if (!normalizedCase.sintomas.length) errors.push('missing_symptoms');
    return errors;
  }

  function normalizeCase(rawCase, source) {
    const nombre = normalizeString(pick(rawCase, ['Nombre', 'Nombre ', 'nombre']));
    const edad = toNumber(pick(rawCase, ['Edad', 'Edad ', 'edad']));
    const genero = normalizeGender(pick(rawCase, ['Género', 'Genero', 'genero']));
    const localizacion = normalizeString(pick(rawCase, ['Localización', 'Localizacion', 'localizacion', 'Ubicacion', 'Ubicación']));
    const sintomasRaw = pick(rawCase, ['síntomas principales', 'síntomas principales  ', 'sintomas', 'sintomas_principales']);
    const gravedadRaw = pick(rawCase, ['Nivel de afectación', 'Nivel de afectacion', 'gravedad']);
    const pruebas = normalizeString(pick(rawCase, ['Pruebas realizadas', 'Pruebas realizadas  (ej: array genético, EEG, resonancia)  ']));
    const medicamentos = normalizeString(pick(rawCase, ['Medicamentos actuales/pasados', 'Medicamentos actuales/pasados\n (ej: risperidona, magnesio):  ', 'medicamentos']));
    const terapias = normalizeString(pick(rawCase, ['Terapias recibidas', 'Terapias recibidas\n(logopedia, psicoterapia, etc.):  ', 'terapias']));
    const estudios = normalizeString(pick(rawCase, ['¿Ha participado en estudios clinicos o geneticos?', 'Â¿Ha participado en estudios clÃ\xadnicos o genÃ©ticos?']));
    const necesidades = normalizeString(pick(rawCase, [' Necesidades y Desafíos', 'Necesidades y Desafíos', 'desafios']));

    const normalizedCase = {
      ...rawCase,
      __origen: source,
      origen: source,
      nombre,
      Nombre: nombre,
      edad,
      Edad: edad,
      genero,
      'Género': genero,
      localizacion,
      Localizacion: localizacion,
      Localización: localizacion,
      sintomas: splitSymptoms(sintomasRaw),
      sintomasTexto: normalizeString(sintomasRaw),
      gravedad: normalizeSeverity(gravedadRaw),
      gravedadTexto: normalizeString(gravedadRaw),
      pruebas,
      medicamentos,
      terapias,
      estudios,
      necesidades,
      validado: source === 'validado'
    };

    normalizedCase.validationErrors = validateCase(normalizedCase);
    normalizedCase.normalized = true;
    return normalizedCase;
  }

  async function loadCases() {
    const [validatedRaw, nonValidatedRaw] = await Promise.all([
      fetchJson(DATA_FILES.validados),
      fetchJson(DATA_FILES.noValidados)
    ]);

    const validated = validatedRaw.map(item => normalizeCase(item, 'validado'));
    const nonValidated = nonValidatedRaw.map(item => normalizeCase(item, 'no_validado'));

    return [...validated, ...nonValidated];
  }

  window.dataService = {
    loadCases,
    normalizeCase,
    validateCase
  };
})();
