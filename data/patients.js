// patients.js
const DATA_URLS = [
  'https://raw.githubusercontent.com/Evelez23/gen15Qproject/main/data/pacientes.json',
  './data/pacientes.json' // Fallback local
];

async function loadPatients() {
  for (const url of DATA_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      renderPatients(data);
      return; // Si tiene éxito, termina aquí
    } catch (error) {
      console.warn(`Error con ${url}:`, error);
    }
  }
  alert("No se pudieron cargar los datos. Por favor recarga la página.");
}

function renderPatients(patientsData) {
  // Ejemplo: Crear tarjetas para cada paciente
  const container = document.getElementById('patients-container');
  
  patientsData.forEach(patient => {
    const card = document.createElement('div');
    card.className = 'patient-card';
    card.innerHTML = `
      <h3>${patient.Nombre}</h3>
      <p><strong>Edad:</strong> ${patient.Edad}</p>
      <p><strong>Síntomas:</strong> ${patient['síntomas principales']}</p>
      <p><strong>Necesidades:</strong> ${patient['Necesidades y Desafíos']}</p>
    `;
    container.appendChild(card);
  });
}

// Iniciar cuando la página cargue
document.addEventListener('DOMContentLoaded', loadPatients);