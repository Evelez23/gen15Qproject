/**
 * Funciones utilitarias
 */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

/**
 * Normalización de datos
 */
const normalizePatientData = (patient) => {
  const symptoms = patient.sintomas || '';
  const severity = patient.gravedad || '';
  
  return {
    id: crypto.randomUUID(),
    name: patient.nombre || 'Anónimo',
    age: Number(patient.edad) || 0,
    gender: patient.genero || 'No especificado',
    location: patient.localizacion || 'No especificado',
    symptoms: symptoms.split(';').map(s => s.trim()).filter(Boolean),
    severity: severity.toLowerCase().includes('grave') ? 'high' : 
              severity.toLowerCase().includes('moder') ? 'medium' : 'low',
    validated: patient.__origen === 'validado',
    tests: patient.pruebas?.split(';').map(t => t.trim()).filter(Boolean) || [],
    therapies: patient.terapias?.split(';').map(t => t.trim()).filter(Boolean) || []
  };
};

/**
 * Carga de datos
 */
const loadPatientsData = async () => {
  try {
    const responses = await Promise.all([
      fetch('data.json'),
      fetch('casos_no_validados.json'),
      fetch('casos_validados.json')
    ]);
    
    const [data, noValidados, validados] = await Promise.all(
      responses.map(res => res.json())
    );
    
    return [
      ...data,
      ...noValidados,
      ...validados
    ].map(normalizePatientData);
  } catch (error) {
    console.error('Error loading patient data:', error);
    return [];
  }
};

/**
 * UI Helpers
 */
const createBadge = (text, type = 'info') => {
  const badge = document.createElement('span');
  badge.className = `badge badge-${type}`;
  badge.textContent = text;
  return badge;
};

const renderPatientCard = (patient) => {
  const card = document.createElement('div');
  card.className = 'patient-card';
  card.innerHTML = `
    <h3>${patient.name}</h3>
    <div class="patient-meta">
      <span>${patient.age} años</span>
      <span>•</span>
      <span>${patient.gender}</span>
      <span>•</span>
      <span>${patient.location}</span>
    </div>
    <div class="patient-symptoms">
      ${patient.symptoms.map(s => `<span class="symptom-tag">${s}</span>`).join('')}
    </div>
    ${patient.validated ? '<span class="verified-badge">Verificado</span>' : ''}
  `;
  return card;
};

/**
 * Inicialización
 */
const initApp = async () => {
  // Cargar datos
  const patients = await loadPatientsData();
  
  // Actualizar UI
  if ($('#kpis')) {
    renderKPIs(patients);
  }
  
  if ($('#patient-list')) {
    renderPatientList(patients);
  }
  
  // Configurar menú móvil
  const menuToggle = $('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      $('.nav').classList.toggle('active');
    });
  }
};

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
