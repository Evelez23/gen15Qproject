import { read, utils } from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';

// Configuración
const EXCEL_URL = 'https://raw.githubusercontent.com/Evelez23/gen15Qproject/main/main/listaPacientes.xlsx';
const LOCAL_BACKUP = 'data/backup_pacientes.xlsx';

// Función mejorada para corregir caracteres
const fixEncoding = (str) => {
  if (!str) return 'No especificado';
  return str
    .replace(/Ã¡/g, 'á').replace(/Ã©/g, 'é').replace(/Ã/g, 'í')
    .replace(/Ã³/g, 'ó').replace(/Ãº/g, 'ú').replace(/Ã±/g, 'ñ')
    .replace(/Ã¼/g, 'ü').replace(/Â¿/g, '¿').replace(/Â¡/g, '¡')
    .replace(/Ã‰/g, 'É').replace(/Ã“/g, 'Ó');
};

// Mostrar estado de carga
function showLoading() {
  const container = document.getElementById('patientContainer');
  container.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cargando datos de pacientes...</p>
    </div>
  `;
}

// Función mejorada para procesar datos
function processPatientData(rawData) {
  return rawData.map(p => {
    // Manejo robusto de todos los campos
    const getField = (fieldNames, defaultValue = 'No especificado') => {
      for (const name of fieldNames) {
        if (p[name] !== undefined && p[name] !== '') {
          return fixEncoding(p[name]);
        }
      }
      return defaultValue;
    };

    return {
      nombre: getField(['Nombre', 'nombre'], 'Nombre no disponible'),
      edad: getField(['Edad', 'edad']),
      genero: getField(['*Género', '*GÃ©nero']) === 'F' ? 'Femenino' : 'Masculino',
      sintomas: getField(['Síntomas principales', 'SÃ­ntomas principales']),
      pruebas: getField(['Pruebas realizadas']),
      medicamentos: getField(['Medicamentos actuales/pasados']),
      terapias: getField(['Terapias recibidas']),
      estudios: getField(['Â¿Ha participado en estudios clÃ­nicos o genÃ©ticos?']),
      necesidades: getField(['Necesidades y Desafíos'])
    };
  });
}

// Renderizar pacientes con formato mejorado
function renderPatients(pacientes) {
  const container = document.getElementById('patientContainer');
  const statsElement = document.getElementById('stats');
  
  statsElement.textContent = `${pacientes.length} casos registrados`;
  
  let htmlContent = '';
  const grupos = {
    Femenino: pacientes.filter(p => p.genero === 'Femenino'),
    Masculino: pacientes.filter(p => p.genero === 'Masculino')
  };

  Object.entries(grupos).forEach(([genero, lista]) => {
    if (lista.length === 0) return;
    
    htmlContent += `
      <section class="gender-section">
        <h2>${genero} (${lista.length})</h2>
        <div class="patient-grid">
    `;
    
    lista.forEach(paciente => {
      htmlContent += `
        <div class="patient-card">
          <div class="patient-card-header">
            <h3>${paciente.nombre}</h3>
            <div class="patient-meta">
              <span class="patient-age">${paciente.edad} años</span>
              <span class="patient-gender">${paciente.genero}</span>
            </div>
          </div>
          
          <div class="patient-details">
            <div class="detail-group">
              <h4>Síntomas principales:</h4>
              <p>${paciente.sintomas.replace(/;/g, ', ')}</p>
            </div>
            
            <div class="detail-group">
              <h4>Pruebas realizadas:</h4>
              <p>${paciente.pruebas}</p>
            </div>
            
            <div class="detail-group">
              <h4>Medicamentos:</h4>
              <p>${paciente.medicamentos}</p>
            </div>
            
            <div class="detail-group">
              <h4>Terapias recibidas:</h4>
              <p>${paciente.terapias}</p>
            </div>
            
            <div class="detail-group">
              <h4>Participación en estudios:</h4>
              <p>${paciente.estudios}</p>
            </div>
            
            <div class="detail-group">
              <h4>Necesidades y desafíos:</h4>
              <p>${paciente.necesidades}</p>
            </div>
          </div>
        </div>
      `;
    });
    
    htmlContent += `</div></section>`;
  });
  
  container.innerHTML = htmlContent || '<p class="no-patients">No se encontraron pacientes registrados</p>';
}

// Carga principal de datos
document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  
  try {
    // Intenta cargar desde la URL principal primero
    let response = await fetch(EXCEL_URL);
    
    // Si falla, intenta con el backup local
    if (!response.ok) {
      console.warn('Fallo al cargar Excel remoto, intentando con backup local');
      response = await fetch(LOCAL_BACKUP);
    }
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.arrayBuffer();
    const workbook = read(data);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const pacientes = utils.sheet_to_json(firstSheet);
    
    if (!pacientes || pacientes.length === 0) {
      throw new Error('El archivo Excel no contiene datos de pacientes');
    }
    
    const pacientesNormalizados = processPatientData(pacientes);
    renderPatients(pacientesNormalizados);
    
  } catch (error) {
    console.error('Error:', error);
    showError(error);
  }
});

function showError(error) {
  const container = document.getElementById('patientContainer');
  container.innerHTML = `
    <div class="error-card">
      <h3>Error al cargar los datos</h3>
      <p>${error.message}</p>
      <p>Por favor, verifica:</p>
      <ul>
        <li>Que el archivo Excel esté en la ubicación correcta</li>
        <li>Que tengas conexión a internet</li>
      </ul>
      <button onclick="window.location.reload()">Reintentar</button>
    </div>
  `;
}
// patients.js - Solo las funciones clave para añadir
async function loadPatientData() {
  const DATA_SOURCES = [
    'https://raw.githubusercontent.com/Evelez23/gen15Qproject/main/data/pacientes.json',
    './data/pacientes.json'
  ];

  for (const source of DATA_SOURCES) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${source}:`, error);
    }
  }
  throw new Error("No se pudieron cargar los datos");
}

// Ejemplo de cómo integrarlo con tu código existente:
async function initPatientView() {
  try {
    const data = await loadPatientData();
    // Usa data.pacientes aquí con tu lógica actual
    console.log("Datos cargados:", data.pacientes);
  } catch (error) {
    console.error("Error:", error);
    // Manejo de errores
  }
}

// Llama a tu función de inicialización
document.addEventListener('DOMContentLoaded', initPatientView);
