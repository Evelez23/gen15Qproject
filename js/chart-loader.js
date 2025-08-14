// chart-loader.js - Carga y muestra gráficos estadísticos
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 1. Cargar datos de pacientes
        const response = await fetch('https://raw.githubusercontent.com/Evelez23/gen15Qproject/main/data/pacientes.json');
        if (!response.ok) throw new Error("Error al cargar datos");
        const data = await response.json();
        
        // 2. Procesar datos para estadísticas
        const stats = processPatientData(data.pacientes);
        
        // 3. Renderizar gráficos
        renderCharts(stats);
        
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('charts-container').innerHTML = `
            <div class="error">
                <p>⚠️ No se pudieron cargar los gráficos. Error: ${error.message}</p>
            </div>
        `;
    }
});

function processPatientData(patients) {
    // Estadísticas por género
    const genderCount = patients.reduce((acc, patient) => {
        acc[patient.Género] = (acc[patient.Género] || 0) + 1;
        return acc;
    }, {M: 0, F: 0});
    
    // Estadísticas por nivel de afectación
    const severityCount = patients.reduce((acc, patient) => {
        const level = patient['Nivel de afectación'].split(' ')[0];
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});
    
    // Síntomas más comunes
    const symptoms = {};
    patients.forEach(patient => {
        patient['Síntomas principales'].split(';').forEach(symptom => {
            const cleanSymptom = symptom.trim();
            symptoms[cleanSymptom] = (symptoms[cleanSymptom] || 0) + 1;
        });
    });
    
    return {
        gender: genderCount,
        severity: severityCount,
        symptoms: Object.entries(symptoms)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
    };
}

function renderCharts(stats) {
    // Gráfico de género
    renderPieChart('gender-chart', {
        labels: ['Niños', 'Niñas'],
        data: [stats.gender.M, stats.gender.F],
        colors: ['#3498db', '#e91e63']
    });
    
    // Gráfico de severidad
    renderBarChart('severity-chart', {
        labels: Object.keys(stats.severity),
        data: Object.values(stats.severity),
        color: '#2c3e50'
    });
    
    // Gráfico de síntomas
    renderHorizontalBarChart('symptoms-chart', {
        labels: stats.symptoms.map(s => s[0]),
        data: stats.symptoms.map(s => s[1]),
        color: '#27ae60'
    });
}

// Funciones auxiliares para renderizar gráficos con Chart.js
function renderPieChart(canvasId, {labels, data, colors}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderBarChart(canvasId, {labels, data, color}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pacientes',
                data: data,
                backgroundColor: color,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderHorizontalBarChart(canvasId, {labels, data, color}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Frecuencia',
                data: data,
                backgroundColor: color,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    });
}
