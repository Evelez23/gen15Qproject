fetch('data/microdeletion.json')
  .then(res => res.json())
  .then(data => {
    renderNeuroMap(data);
    renderStories(data);
  });

function renderNeuroMap(data) {
  const container = document.getElementById('visualization');
  container.innerHTML = '';

  data.forEach((entry, index) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.title = `Paciente ${entry.id}: ${entry.symptoms.join(', ')}`;
    dot.style.position = 'absolute';
    dot.style.left = `${Math.random() * 90}%`;
    dot.style.top = `${Math.random() * 90}%`;
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.backgroundColor = '#00FFD1';
    dot.style.borderRadius = '50%';
    container.appendChild(dot);
  });
}

function renderStories(data) {
  const container = document.getElementById('story-cards');
  container.innerHTML = '';

  data.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.innerHTML = `
      <h3>Paciente ${entry.id}</h3>
      <p><strong>Edad:</strong> ${entry.age}</p>
      <p><strong>Historia:</strong> ${entry.story}</p>
    `;
    container.appendChild(card);
  });
}
