// ---BUSCADOR---
// cargar los elementos
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('form-buscador');
  const artistaInput = document.getElementById('artista');
  const provinciaSelect = document.getElementById('provincia');
  const desdeInput = document.getElementById('fecha-desde');
  const hastaInput = document.getElementById('fecha-hasta');

  // setear mínimo de fechas al cargar la página
  const fechaHoy = new Date().toISOString().split("T")[0];
  desdeInput.setAttribute("min", fechaHoy);
  hastaInput.setAttribute("min", fechaHoy);

  // cargar conciertos desde JSON
  let conciertos = [];
  fetch("conciertos.json")
    .then(response => response.json())
    .then(data => {
      conciertos = data;
      console.log("Conciertos cargados:", conciertos);
    })
    .catch(err => console.error("Error al cargar conciertos:", err));

  // parsear fecha en formato "DD/MM/YYYY" a Date
  function parseFechaDDMMYYYY(str) {
    if (!str) return null;
    if (str.includes("/")) {
      const [d, m, y] = str.split("/");
      return new Date('${y}-${m}-${d}'); // "YYYY-MM-DD"
    }
    return new Date(str);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // leer valores ingresados
    const artista = artistaInput.value.trim().toLowerCase();
    const provincia = provinciaSelect.value.trim().toLowerCase();
    const modal = document.getElementById("modalResultados");
    const cerrarModalX = document.getElementById("cerrar-modal-X");
    const cerrarModalBoton = document.getElementById('cerrar-modal-boton');
    const fechaDesde = desdeInput.value;
    const fechaHasta = hastaInput.value;

    // validación fecha, antes de filtrar
    if (fechaDesde && fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)) {
      alert("La fecha final no puede ser menor a la fecha inicial.");
      return; 
    }

    // convertir fechas a Date si existen
    const desde = fechaDesde ? new Date(fechaDesde) : null;
    const hasta = fechaHasta ? new Date(fechaHasta) : null;

    function mostrarModal() {
    modal.style.display = "flex";
    }

    // filtro usando las variables ya definidas 
    const resultados = conciertos.filter(c => {
      const fechaEvento = parseFechaDDMMYYYY(c.fecha);
      return (
        (!artista || (c.artista && c.artista.toLowerCase().includes(artista))) &&
        (provincia === "todas" || (c.provincia && c.provincia.toLowerCase() === provincia)) &&
        (!desde || fechaEvento >= desde) &&
        (!hasta || fechaEvento <= hasta)
      );
    });

    //console.log("Resultados:", resultados);

    mostrarModal();

    // Seleccionamos el contenedor donde vamos a meter resultados
    const resultadosContainer = document.getElementById("resultados-buscador");
    resultadosContainer.innerHTML = ""; // limpiamos por si hay búsquedas anteriores

    if (resultados.length === 0) {
    resultadosContainer.innerHTML = "<p>No se encontraron conciertos con esos filtros.</p>";
    } else {
    resultados.forEach(c => {
        const div = document.createElement("div");
        div.className = "evento";
        div.innerHTML = `
        <h3>${c.artista || "Artista sin nombre"}</h3>
        <p>📍 ${c.provincia || "Provincia no especificada"} - ${c.fecha || "Fecha no especificada"}</p>
        <a href="#" target="_blank">Comprar entrada</a>
        <button>⭐ Agregar a Favoritos</button>
        `;
        resultadosContainer.appendChild(div);
    });
    }

    cerrarModalX.addEventListener("click", () => {
    modal.style.display = "none";
    });

    cerrarModalBoton.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
    });

  });
});
