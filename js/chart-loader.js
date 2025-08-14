document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 1. Verificar que Chart.js esté cargado
    if (typeof Chart === 'undefined') {
      throw new Error('Chart.js no se cargó correctamente');
    }

    // 2. Cargar datos
    const response = await fetch('../data/pacientes.json');
    if (!response.ok) throw new Error('Error al cargar pacientes.json');
    const data = await response.json();
    const patients = data.pacientes || data;

    // 3. Procesar datos para gráficos
    const chartData = {
      severity: this.processSeverityData(patients),
      gender: this.processGenderData(patients)
    };

    // 4. Renderizar gráficos
    this.renderCharts(chartData);
  } catch (error) {
    console.error('Error en chart-loader:', error);
    document.querySelector('.charts-section').innerHTML = `
      <div class="alert alert-danger">
        No se pudieron cargar los gráficos: ${error.message}
      </div>
    `;
  }
});

function processSeverityData(patients) {
  const counts = {
    leve: 0,
    moderado: 0,
    grave: 0,
    desconocido: 0
  };

  patients.forEach(patient => {
    const nivel = (patient.nivel_afectacion || patient['Nivel de afectación'] || '').toLowerCase();
    if (nivel.includes('leve')) counts.leve++;
    else if (nivel.includes('moderado')) counts.moderado++;
    else if (nivel.includes('grave')) counts.grave++;
    else counts.desconocido++;
  });

  return {
    labels: ['Leve', 'Moderado', 'Grave', 'Desconocido'],
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [
        '#4bc0c0',
        '#ffcd56',
        '#ff6384',
        '#cccccc'
      ]
    }]
  };
}

function renderCharts(data) {
  new Chart(
    document.getElementById('severityChart'),
    {
      type: 'doughnut',
      data: data.severity,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    }
  );

  new Chart(
    document.getElementById('genderChart'),
    {
      type: 'pie',
      data: data.gender,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    }
  );
}
