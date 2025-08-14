class PatientManager {
  constructor() {
    this.patients = [];
    this.init();
  }

  async init() {
    await this.loadPatients();
    this.setupEventListeners();
  }

  async loadPatients() {
    try {
      const response = await fetch('data/pacientes.json');
      if (!response.ok) throw new Error("No se encontró el archivo de pacientes");
      const data = await response.json();
      this.patients = data.pacientes || data;
      this.renderPatients();
    } catch (error) {
      console.error("Error cargando pacientes:", error);
      document.getElementById('patientContainer').innerHTML = `
        <div class="alert alert-danger">
          Error al cargar los datos: ${error.message}
        </div>
      `;
    }
  }

  renderPatients(patients = this.patients) {
    const container = document.getElementById('patientContainer');
    container.innerHTML = patients.map(patient => `
      <div class="col-md-4">
        <div class="card patient-card">
          <div class="card-body">
            <h5 class="card-title">
              ${patient.genero === 'M' ? '♂' : '♀'} 
              ${patient.nombre || 'Nombre no disponible'}
            </h5>
            <p class="card-text">
              <strong>Edad:</strong> ${patient.edad || 'N/A'} años<br>
              <strong>Síntomas:</strong> ${this.getMainSymptom(patient)}
            </p>
            <span class="severity-badge ${this.getSeverityClass(patient)}">
              ${this.getSeverityText(patient)}
            </span>
            <button class="btn btn-primary btn-sm mt-2 view-details" 
                    data-name="${patient.nombre}">
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  getMainSymptom(patient) {
    const sintomas = patient.sintomas || patient['Síntomas principales'];
    if (Array.isArray(sintomas)) return sintomas[0] || 'N/A';
    if (typeof sintomas === 'string') return sintomas.split(';')[0] || 'N/A';
    return 'N/A';
  }

  getSeverityClass(patient) {
    const nivel = (patient.nivel_afectacion || patient['Nivel de afectación'] || '').toLowerCase();
    if (nivel.includes('leve')) return 'severity-leve';
    if (nivel.includes('moderado')) return 'severity-moderado';
    if (nivel.includes('grave')) return 'severity-grave';
    return '';
  }

  setupEventListeners() {
    // Filtro de búsqueda
    document.getElementById('searchInput').addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filtered = this.patients.filter(p => 
        (p.nombre || '').toLowerCase().includes(searchTerm) ||
        (p.sintomas || '').toString().toLowerCase().includes(searchTerm)
      );
      this.renderPatients(filtered);
    });

    // Filtro por género
    document.getElementById('genderFilter').addEventListener('change', (e) => {
      const gender = e.target.value;
      const filtered = gender === 'all' 
        ? this.patients 
        : this.patients.filter(p => p.genero === gender);
      this.renderPatients(filtered);
    });

    // Modal de detalles
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('view-details')) {
        const patientName = e.target.dataset.name;
        this.showPatientDetails(patientName);
      }
    });
  }

  showPatientDetails(name) {
    const patient = this.patients.find(p => p.nombre === name);
    if (!patient) return;

    document.getElementById('modalTitle').textContent = patient.nombre;
    document.getElementById('modalBody').innerHTML = `
      <p><strong>Edad:</strong> ${patient.edad || 'N/A'}</p>
      <p><strong>Género:</strong> ${patient.genero === 'M' ? 'Masculino' : 'Femenino'}</p>
      <p><strong>Pruebas realizadas:</strong> ${patient.pruebas_realizadas || 'N/A'}</p>
      <h5>Síntomas</h5>
      <ul>
        ${this.formatList(patient.sintomas || patient['Síntomas principales'])}
      </ul>
    `;
    
    new bootstrap.Modal(document.getElementById('patientModal')).show();
  }

  formatList(data) {
    if (Array.isArray(data)) return data.map(item => `<li>${item}</li>`).join('');
    if (typeof data === 'string') return data.split(';').map(item => `<li>${item.trim()}</li>`).join('');
    return '<li>No disponible</li>';
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  new PatientManager();
});
