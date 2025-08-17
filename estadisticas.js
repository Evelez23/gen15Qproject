const renderStatsCharts = async () => {
  const patients = await loadPatientsData();
  
  // Prevalencia de síntomas
  const symptomsData = {
    'TEA': /tea|autis/i,
    'Hipotonía': /hipoton/i,
    'Disfagia': /disfag/i,
    'Epilepsia': /epilep/i,
    'Cardiopatía': /cardiop/i,
    'TDAH': /tdah/i
  };
  
  const symptomsCount = Object.entries(symptomsData).map(([label, regex]) => ({
    label,
    count: patients.filter(p => p.symptoms.some(s => regex.test(s))).length
  }));
  
  new Chart($('#chartPrev'), {
    type: 'bar',
    data: {
      labels: symptomsCount.map(s => s.label),
      datasets: [{
        label: 'Pacientes afectados',
        data: symptomsCount.map(s => s.count),
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
  
  // Distribución por sexo
  const genderCount = patients.reduce((acc, p) => {
    const gender = p.gender.toLowerCase().includes('fem') ? 'Femenino' : 'Masculino';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});
  
  new Chart($('#chartSexo'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(genderCount),
      datasets: [{
        data: Object.values(genderCount),
        backgroundColor: ['#3b82f6', '#ec4899']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', renderStatsCharts);
