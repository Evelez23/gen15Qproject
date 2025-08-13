import { read, utils } from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';

// Configuración global
const EXCEL_URL = 'https://raw.githubusercontent.com/Evelez23/-microdelecion/main/main/listaPacientes.xlsx';
const LOCAL_BACKUP = 'data/backup_pacientes.xlsx'; // Opcional: puedes subir una copia local

// Función mejorada para corregir caracteres
const fixEncoding = (str) => {
  if (!str) return '';
  return str
    .replace(/Ã¡/g, 'á').replace(/Ã©/g, 'é').replace(/Ã/g, 'í')
    .replace(/Ã³/g, 'ó').replace(/Ãº/g, 'ú').replace(/Ã±/g, 'ñ')
    .replace(/Ã¼/g, 'ü').replace(/Â¿/g, '¿').replace(/Â¡/g, '¡');
};

// Cargar datos con múltiples intentos
async function loadPatientData() {
  const sources = [
    EXCEL_URL,
    LOCAL_BACKUP
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source);
      if (!response.ok) continue;
      
      const data = await response.arrayBuffer();
      const workbook = read(data);
      return utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    } catch (error) {
      console.warn(`Error cargando desde ${source}:`, error);
    }
  }
  throw new Error('No se pudo cargar los datos desde ninguna fuente');
}

// Procesar datos de pacientes
function processPatientData(rawData) {
  return rawData.map(p => ({
    nombre: fixEncoding(p['Nombre'] || ''),
    edad: p['Edad'] || 'N/A',
    genero: (p['*Género'] || p['*GÃ©nero'] || 'M') === 'F' ? 'Femenino' : 'Masculino',
    sintomas: fixEncoding(p['Síntomas principales'] || p['SÃ­ntomas principales'] || 'N/A'),
    pruebas: fixEncoding(p['Pruebas realizadas'] || ''),
    medicamentos: fixEncoding(p['Medicamentos actuales/pasados'] || ''),
    terapias: fixEncoding(p['Terapias recibidas'] || ''),
    estudios: fixEncoding(p['Â¿Ha participado en estudios clÃ­nicos o genÃ©ticos?'] || ''),
    necesidades: fixEncoding(p['Necesidades y Desafíos'] || '')
  }));
}

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

// Renderizar pacientes
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
          ${lista.map(paciente => `
            <div class="patient-card">
              <h3>${paciente.nombre}</h3>
              <p><strong>Edad:</strong> ${paciente.edad}</p>
              <p><strong>Síntomas:</strong> ${paciente.sintomas}</p>
              <button class="details-btn" data-patient='${JSON.stringify(paciente).replace(/'/g, "\\'")}'>
                Ver detalles completos
              </button>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  });
  
  container.innerHTML = htmlContent || '<p>No se encontraron pacientes</p>';

  // Eventos para modales
  document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const patient = JSON.parse(btn.dataset.patient);
      showPatientModal(patient);
    });
  });
}

// Mostrar modal de detalles
function showPatientModal(patient) {
  const modalHtml = `
    <div class="patient-modal">
      <div class="modal-content">
        <h3>${patient.nombre}</h3>
        <div class="patient-details">
          <p><strong>Edad:</strong> ${patient.edad}</p>
          <p><strong>Género:</strong> ${patient.genero}</p>
          
          <h4>Síntomas principales:</h4>
          <p>${patient.sintomas}</p>
          
          <h4>Pruebas realizadas:</h4>
          <p>${patient.pruebas || 'No especificado'}</p>
          
          <h4>Medicamentos:</h4>
          <p>${patient.medicamentos || 'No especificado'}</p>
          
          <h4>Terapias recibidas:</h4>
          <p>${patient.terapias || 'No especificado'}</p>
          
          <h4>Participación en estudios:</h4>
          <p>${patient.estudios || 'No especificado'}</p>
          
          <h4>Necesidades y desafíos:</h4>
          <p>${patient.necesidades || 'No especificado'}</p>
        </div>
        <button class="close-modal">Cerrar</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.querySelector('.close-modal').addEventListener('click', () => {
    document.querySelector('.patient-modal').remove();
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  
  try {
    const rawData = await loadPatientData();
    const pacientes = processPatientData(rawData);
    renderPatients(pacientes);
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('patientContainer').innerHTML = `
      <div class="error-card">
        <h3>Error al cargar los datos</h3>
        <p>${error.message}</p>
        <p>Por favor, verifica:</p>
        <ul>
          <li>Que el archivo Excel esté en la ubicación correcta</li>
          <li>Que tengas conexión a internet</li>
        </ul>
        <button onclick="window.location.reload()">Reintentar</button>
        // Cambiar a módulo
export function initPatientsPage() {
  // Tu código actual aquí
}

// Inicialización automática
if (document.getElementById('patientContainer')) {
  initPatientsPage();
}
      </div>
    `;
  }
});
