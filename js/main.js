/**
 * Funcionalidades globales del sitio
 */

// Inicialización de componentes comunes
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle (si aplica)
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Smooth scrolling para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  // Inicializar tooltips (si se usan)
  const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
  tooltipTriggers.forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
});

// Funciones globales
function showTooltip(e) {
  const tooltipText = this.getAttribute('data-tooltip');
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = tooltipText;
  
  document.body.appendChild(tooltip);
  positionTooltip(this, tooltip);
}

function positionTooltip(element, tooltip) {
  // Lógica para posicionamiento del tooltip
}

function hideTooltip() {
  const tooltip = document.querySelector('.tooltip');
  if (tooltip) {
    tooltip.remove();
  }
}

// Exportar funciones si se usan módulos
export { showTooltip, hideTooltip };
// Cargar datos dinámicamente
fetch('data/pacientes.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('patientContainer');
    
    // Generar tarjetas
    data.forEach(patient => {
      const card = `
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
              <button 
                class="btn btn-sm btn-primary view-details" 
                data-id="${patient['Nombre']}">
                Ver detalles
              </button>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += card;
    });

    // Filtrado por género
    document.getElementById('filterGender').addEventListener('change', (e) => {
      const gender = e.target.value;
      document.querySelectorAll('.patient-card').forEach(card => {
        card.style.display = (gender === 'all' || card.dataset.gender === gender) 
          ? 'block' 
          : 'none';
      });
    });
  });
