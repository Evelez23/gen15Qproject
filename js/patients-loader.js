class PatientLoader {
  constructor() {
    this.patients = [];
    this.init();
  }

  async init() {
    try {
      await this.loadPatients();
      this.setupFilters();
    } catch (error) {
      console.error("Error:", error);
      this.showError();
    }
  }

  async loadPatients() {
    const response = await fetch('../data/pacientes.json');
    if (!response.ok) throw new Error("No se pudieron cargar los datos");
    const data = await response.json();
    this.patients = data.pacientes || data;
    this.renderPatients();
  }

  renderPatients(filteredPatients = null) {
    const container = document.getElementById('patientContainer');
    const patients = filteredPatients || this.patients;
    
    container.innerHTML = patients.map(patient => `
      <div class="col-md-4 mb-4 patient-card" 
           data-gender="${patient.genero || patient.Género || ''}"
           data-severity="${this.getSeverityClass(patient)}">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              ${patient.genero === 'M' ? '♂' : '♀'} 
              ${patient.nombre || patient.Nombre || 'Nombre no disponible'}
            </h5>
            <div class="patient-info">
              <p><strong>Edad:</strong> ${patient.edad || patient.Edad || 'N/A'} años</p>
              <p><strong>Síntoma principal:</strong> 
                ${this.getMainSymptom(patient)}
              </p>
              <span class="severity-badge ${this.getSeverityClass(patient)}">
                ${this.getSeverityText(patient)}
              </span>
            </div>
            <button class="btn btn-sm btn-primary view-details" 
                    data-id="${patient.nombre || patient.Nombre}">
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Métodos auxiliares...
  getSeverityClass(patient) {
    const nivel = (patient.nivel_afectacion || patient['Nivel de afectación'] || '').toLowerCase();
    if (nivel.includes('leve')) return 'severity-mild';
    if (nivel.includes('moderado')) return 'severity-moderate';
    if (nivel.includes('grave')) return 'severity-severe';
    return '';
  }

  getMainSymptom(patient) {
    const sintomas = patient.sintomas || patient['Síntomas principales'];
    if (Array.isArray(sintomas)) return sintomas[0] || 'N/A';
    if (typeof sintomas === 'string') return sintomas.split(';')[0] || 'N/A';
    return 'N/A';
  }

  setupFilters() {
    document.getElementById('filterGender').addEventListener('change', () => this.filterPatients());
    document.getElementById('filterSeverity').addEventListener('change', () => this.filterPatients());
    document.getElementById('patientSearch').addEventListener('input', () => this.filterPatients());
  }

  filterPatients() {
    const genderFilter = document.getElementById('filterGender').value;
    const severityFilter = document.getElementById('filterSeverity').value;
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();

    const filtered = this.patients.filter(patient => {
      const genderMatch = genderFilter === 'all' || 
                         (patient.genero || patient.Género) === genderFilter;
      const severityMatch = severityFilter === 'all' || 
                          (patient.nivel_afectacion || patient['Nivel de afectación'] || '')
                            .toLowerCase().includes(severityFilter);
      const searchMatch = (patient.nombre || patient.Nombre || '').toLowerCase().includes(searchTerm) || 
                         (patient.sintomas || patient['Síntomas principales'] || '')
                            .toString().toLowerCase().includes(searchTerm);
      
      return genderMatch && severityMatch && searchMatch;
    });

    this.renderPatients(filtered);
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  new PatientLoader();
});