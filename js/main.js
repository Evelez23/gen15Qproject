/**
 * Funcionalidades globales del sitio
 */

// Configuración inicial cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSmoothScrolling();
  initTooltips();
  loadPatientData();
});

// 1. Menú móvil
function initMobileMenu() {
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

// 2. Scroll suave
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
}

// 3. Tooltips
function initTooltips() {
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  tooltipTriggers.forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(e) {
  const tooltipText = this.getAttribute('data-tooltip');
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = tooltipText;
  
  document.body.appendChild(tooltip);
  positionTooltip(this, tooltip);
}

function positionTooltip(element, tooltip) {
  // Implementa la lógica de posicionamiento aquí
  const rect = element.getBoundingClientRect();
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
  tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
}

function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// 4. Funcionalidad de pacientes
async function loadPatientData() {
  try {
    const response = await fetch('data/pacientes.json');
    const data = await response.json();
    renderPatients(data);
    setupPatientFilters(data);
    setupModalHandlers(data);
  } catch (error) {
    console.error('Error cargando datos:', error);
    document.getElementById('patientContainer').innerHTML = `
      <div class="alert alert-danger">
        Error al cargar los datos de pacientes. Por favor intenta más tarde.
      </div>
    `;
  }
}

function renderPatients(patients) {
  const container = document.getElementById('patientContainer');
  container.innerHTML = patients.map(patient => `
    <div class="col-md-4 mb-4 patient-card" data-gender="${patient['Género']}">
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">
            ${patient['Género'] === 'M' ? '♂' : '♀'} 
            ${patient['Nombre']}
          </h5>
          <p class="card-text">
            <strong>Edad:</strong> ${patient['Edad']}<br>
            <strong>Síntomas:</strong> ${patient['Síntomas principales'].split(';')[0]}
          </p>
          <button class="btn btn-sm btn-primary view-details" data-id="${patient['Nombre']}">
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function setupPatientFilters() {
  document.getElementById('filterGender')?.addEventListener('change', (e) => {
    const gender = e.target.value;
    document.querySelectorAll('.patient-card').forEach(card => {
      card.style.display = (gender === 'all' || card.dataset.gender === gender) 
        ? 'block' 
        : 'none';
    });
  });
}

function setupModalHandlers(patientData) {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-details')) {
      const patientName = e.target.dataset.id;
      const patient = patientData.find(p => p['Nombre'] === patientName);
      
      if (patient) {
        showPatientModal(patient);
      }
    }
  });
}

function showPatientModal(patient) {
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  if (!modalTitle || !modalBody) return;

  modalTitle.textContent = patient['Nombre'];
  modalBody.innerHTML = `
    <p><strong>Edad:</strong> ${patient['Edad']}</p>
    <p><strong>Pruebas realizadas:</strong> ${patient['Pruebas realizadas']}</p>
    <hr>
    <h6>Síntomas:</h6>
    <ul>
      ${patient['Síntomas principales'].split(';').map(s => `<li>${s.trim()}</li>`).join('')}
    </ul>
    <h6 class="mt-3">Medicamentos:</h6>
    <p>${patient['Medicamentos actuales/pasados'] || 'No especificado'}</p>
  `;

  // Mostrar modal usando Bootstrap
  const modal = new bootstrap.Modal(document.getElementById('patientModal'));
  modal.show();
}
