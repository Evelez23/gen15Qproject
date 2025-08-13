/**
 * Carga y renderiza gráficos estadísticos
 */

import { read, utils } from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';

const excelUrl = 'https://raw.githubusercontent.com/Evelez23/gen15Qproject/main/main/listaPacientes.xlsx';

export async function loadAndRenderCharts() {
  try {
    // 1. Cargar datos
    const response = await fetch(excelUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.arrayBuffer();
    const workbook = read(data);
    const pacientes = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    
    // 2. Procesar datos
    const processedData = processPatientData(pacientes);
    
    // 3. Renderizar gráficos
    renderGenderChart(processedData.gender);
    renderAgeChart(processedData.ages);
    renderSymptomChart(processedData.symptoms);
    
  } catch (error) {
    console.error('Error loading charts:', error);
    showError('Error al cargar datos estadísticos. Intente recargar la página.');
  }
}

function processPatientData(pacientes) {
  // Procesamiento de datos para gráficos
  const genders = {
    Femenino: pacientes.filter(p => p['*Género'] === 'F' || p['*GÃ©nero'] === 'F').length,
    Masculino: pacientes.filter(p => p['*Género'] === 'M' || p['*GÃ©nero'] === 'M').length
  };

  const ages = pacientes.map(p => parseInt(p.Edad) || 0).filter(age => !isNaN(age));
  
  const symptoms = {};
  pacientes.forEach(p => {
    const sintomas = (p['Síntomas principales'] || p['SÃ­ntomas principales'] || '').split(';');
    sintomas.forEach(s => {
      const symptom = s.trim();
      if (symptom) symptoms[symptom] = (symptoms[symptom] || 0) + 1;
    });
  });

  return { gender: genders, ages, symptoms };
}

function renderGenderChart(data) {
  const ctx = document.getElementById('genderChart');
  if (!ctx) return;
  
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: ['#FF6B6B', '#4A6FA5']
      }]
    }
  });
}

function renderAgeChart(ages) {
  const ctx = document.getElementById('ageChart');
  if (!ctx) return;
  
  // Agrupar por rangos de edad
  const ageGroups = {
    '0-5': ages.filter(a => a <= 5).length,
    '6-12': ages.filter(a => a > 5 && a <= 12).length,
    '13-18': ages.filter(a => a > 12 && a <= 18).length,
    '19+': ages.filter(a => a > 18).length
  };
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(ageGroups),
      datasets: [{
        label: 'Pacientes',
        data: Object.values(ageGroups),
        backgroundColor: '#6BFF6B'
      }]
    }
  });
}

function renderSymptomChart(symptoms) {
  const ctx = document.getElementById('symptomChart');
  if (!ctx) return;
  
  const sortedSymptoms = Object.entries(symptoms)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedSymptoms.map(s => s[0]),
      datasets: [{
        label: 'Frecuencia',
        data: sortedSymptoms.map(s => s[1]),
        backgroundColor: '#FFA500'
      }]
    },
    options: {
      indexAxis: 'y'
    }
  });
}

function showError(message) {
  const container = document.querySelector('.chart-container') || document.body;
  const errorDiv = document.createElement('div');
  errorDiv.className = 'chart-error';
  errorDiv.innerHTML = `
    <p>${message}</p>
    <button onclick="window.location.reload()">Reintentar</button>
  `;
  container.appendChild(errorDiv);
}

// Inicialización automática si es el módulo principal
if (document.getElementById('genderChart')) {
  loadAndRenderCharts();
}