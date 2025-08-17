fetch('data.json')
  .then(res => res.json())
  .then(data => {
    renderCards(data);
    renderChart(data);
    setupFilter(data);
  });

function renderCards(data) {
  const container = document.getElementById('cards');
  container.innerHTML = '';
  data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h2>${p.nombre}</h2>
      <p><strong>Edad:</strong> ${p.edad}</p>
      <p><strong>Síntomas:</strong> ${p.sintomas.join(', ')}</p>
      <p><strong>Genotipo:</strong> ${p.genotipo}</p>`;
    container.appendChild(card);
  });
}

function renderChart(data) {
  const ctx = document.getElementById('symptomChart').getContext('2d');
  const allSymptoms = data.flatMap(p => p.sintomas);
  const counts = {};
  allSymptoms.forEach(s => counts[s] = (counts[s] || 0) + 1);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [{
        label: 'Frecuencia de síntomas',
        data: Object.values(counts),
        backgroundColor: '#00c2a8'
      }]
    }
  });
}

function setupFilter(data) {
  document.getElementById('genotipoFilter').addEventListener('change', e => {
    const val = e.target.value;
    const filtered = val === 'all' ? data : data.filter(p => p.genotipo === val);
    renderCards(filtered);
    renderChart(filtered);
  });
}

document.getElementById('toggleDark').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
