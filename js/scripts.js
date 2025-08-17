async function cargarCasos() {
  const validados = await fetch('casos_validados.json').then(r => r.json());
  const noValidados = await fetch('casos_no_validados.json').then(r => r.json());

  mostrarCasos(validados, 'validados');
  mostrarCasos(noValidados, 'noValidados');
  generarGraficos([...validados, ...noValidados]);
}

function mostrarCasos(casos, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  casos.forEach(caso => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${caso.Nombre} (${caso.Edad} años, ${caso.Género})</h3>
      <p><strong>Localización:</strong> ${caso.Localizacion}</p>
      <p><strong>Síntomas:</strong> ${caso["síntomas principales"]}</p>
      <p><strong>Terapias:</strong> ${caso["Terapias recibidas"]}</p>
      <p><strong>Medicamentos:</strong> ${caso["Medicamentos actuales/pasados"]}</p>
      <p><strong>Desafíos:</strong> ${caso["Necesidades y Desafíos"]}</p>
    `;
    contenedor.appendChild(div);
  });
}

function generarGraficos(casos) {
  const edades = casos.map(c => c.Edad);
  const sintomas = casos.flatMap(c => c["síntomas principales"].split(',').map(s => s.trim()));
  const conteoSintomas = {};
  sintomas.forEach(s => conteoSintomas[s] = (conteoSintomas[s] || 0) + 1);

  new Chart(document.getElementById('graficoEdad'), {
    type: 'bar',
    data: {
      labels: edades,
      datasets: [{
        label: 'Distribución de edades',
        data: edades,
        backgroundColor: '#005a9c'
      }]
    }
  });

  new Chart(document.getElementById('graficoSintomas'), {
    type: 'pie',
    data: {
      labels: Object.keys(conteoSintomas),
      datasets: [{
        label: 'Síntomas frecuentes',
        data: Object.values(conteoSintomas),
        backgroundColor: ['#005a9c', '#4db6ac', '#ff8a65', '#9575cd']
      }]
    }
  });
}

document.addEventListener('DOMContentLoaded', cargarCasos);
