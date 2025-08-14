document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Cargar datos
    const response = await fetch('data/pacientes.json');
    if (!response.ok) throw new Error("No se pudo cargar pacientes.json");
    const data = await response.json();
    const patients = data.pacientes || data;

    // 2. Procesar datos para gráficos
    const severityData = this.processSeverityData(patients);
    const genderData = this.processGenderData(patients);

    // 3. Renderizar gráficos
    this.renderCharts(severityData, genderData);
  } catch (error) {
    console.error("Error en gráficos:", error);
    document.querySelector('.row.mt-5').innerHTML = `
      <div class="alert alert-danger">
        No se pudieron cargar los gráficos: ${error.message}
      </div>
    `;
  }
});

function processSeverityData(patients) {
  const counts = { leve: 0, moderado: 0, grave: 0 };
  
  patients.forEach(patient => {
    const nivel = (patient.nivel_afectacion || patient['Nivel de afectación'] || '').toLowerCase();
    if (nivel.includes('leve')) counts.leve++;
    else if (nivel.includes('moderado')) counts.moderado++;
    else if (nivel.includes('grave')) counts.grave++;
  });

  return {
    labels: ['Leve', 'Moderado', 'Grave'],
    datasets: [{
      data: Object.values(counts),
      backgroundColor: ['#4bc0c0', '#ffcd56', '#ff6384']
    }]
  };
}

function renderCharts(severityData, genderData) {
  // Gráfico de severidad
  new Chart(
    document.getElementById('severityChart'),
    {
      type: 'doughnut',
      data: severityData,
      options: { responsive: true }
    }
  );

  // Gráfico de género
  new Chart(
    document.getElementById('genderChart'),
    {
      type: 'pie',
      data: genderData,
      options: { responsive: true }
    }
  );
}
