async function cargarEstadisticas() {
  try {
    const [validados, noValidados] = await Promise.all([
      fetch("data/casos_validados.json").then(r => r.json()),
      fetch("data/casos_no_validados.json").then(r => r.json())
    ]);

    const totalCasos = validados.length + noValidados.length;
    const paises = new Set([
      ...validados.map(c => c.localizacion).filter(Boolean),
      ...noValidados.map(c => c.localizacion).filter(Boolean)
    ]);

    document.getElementById("total-casos").textContent = totalCasos;
    document.getElementById("validados").textContent = validados.length;
    document.getElementById("no-validados").textContent = noValidados.length;
    document.getElementById("paises").textContent = paises.size;

  } catch (err) {
    console.error("Error cargando estadísticas", err);
  }
}

document.addEventListener("DOMContentLoaded", cargarEstadisticas);
