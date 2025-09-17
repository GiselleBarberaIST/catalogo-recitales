// ---MENÚ HAMBURGUESA---
const menuHamburguesa = document.getElementById('menuHamburguesa');
const menuU1 = document.querySelector('header nav ul');

menuHamburguesa.addEventListener('click', () => {
  menuU1.classList.toggle('show');
})

// ---BUSCADOR---
document.addEventListener("DOMContentLoaded", () => { 

  // Setear mínimo de fechas al cargar la página
  const fechaHoy = new Date().toISOString().split("T")[0];
  const desdeInput = document.getElementById('fecha-desde');
  const hastaInput = document.getElementById('fecha-hasta');
  desdeInput?.setAttribute("min", fechaHoy);
  hastaInput?.setAttribute("min", fechaHoy);

  // Cargar conciertos desde JSON
  let conciertos = [];
  fetch("conciertos.json")
    .then(response => response.json())
    .then(data => {
      conciertos = data;
      console.log("Conciertos cargados:", conciertos);
    })
    .catch(err => console.error("Error al cargar conciertos:", err));

  // Cargar buscador dinámicamente
  fetch('buscador.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('cont-buscador').innerHTML = html;

      // Obtener los elementos del buscador
      const form = document.getElementById('form-buscador');
      const artistaInput = document.getElementById('artista');
      const provinciaSelect = document.getElementById('provincia');
      const modalBuscador = document.getElementById('modalBuscador');
      const btnAbrirBuscador = document.getElementById('abrirBuscador');
      const cerrarModalBuscador = modalBuscador.querySelector('#cerrar-modal-X');

      // Abrir modal buscador
      btnAbrirBuscador.addEventListener('click', (e) => {
        e.preventDefault();
        modalBuscador.style.display = 'flex';
      });

      // Cerrar modal buscador
      cerrarModalBuscador.addEventListener('click', () => {
        modalBuscador.style.display = 'none';
      });

      window.addEventListener('click', (e) => {
        if(e.target === modalBuscador) modalBuscador.style.display = 'none';
      });

      // Modal resultados
      const modalResultados = document.getElementById('modalResultados');
      const cerrarResultadosX = document.getElementById('cerrar-modal-resultados');
      const cerrarResultadosBtn = document.getElementById('cerrar-modal-boton');

      cerrarResultadosX?.addEventListener('click', () => {
        modalResultados.style.display = 'none';
      });
      cerrarResultadosBtn?.addEventListener('click', () => {
        modalResultados.style.display = 'none';
      });
      window.addEventListener('click', (e) => {
        if(e.target === modalResultados) modalResultados.style.display = 'none';
      });

      // Manejo del formulario
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const artista = artistaInput.value.trim().toLowerCase();
        const provincia = provinciaSelect.value.trim().toLowerCase();
        const fechaDesde = desdeInput.value;
        const fechaHasta = hastaInput.value;

        if(fechaDesde && fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)){
          alert("La fecha final no puede ser menor a la fecha inicial.");
          return;
        }

        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;

        const resultados = conciertos.filter(c => {
          const fechaEvento = parseFechaDDMMYYYY(c.fecha);
          return (
            (!artista || (c.artista && c.artista.toLowerCase().includes(artista))) &&
            (provincia === "todas" || (c.provincia && c.provincia.toLowerCase() === provincia)) &&
            (!desde || fechaEvento >= desde) &&
            (!hasta || fechaEvento <= hasta)
          );
        });

          // Cerrar modal con la X
          cerrarModalBuscador.addEventListener('click', () => {
            modalBuscador.style.display = 'none';
          });

        // Mostrar resultados
        const resultadosContainer = document.getElementById("resultados-buscador");
        resultadosContainer.innerHTML = "";

        if(resultados.length === 0){
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

        modalResultados.style.display = "flex";
        modalBuscador.style.display = 'none';
      });
      
    })
    .catch(err => console.log('Error al cargar el buscador: ', err));

  // Función auxiliar para parsear fechas
  function parseFechaDDMMYYYY(str) {
    if (!str) return null;
    if (str.includes("/")) {
      const [d, m, y] = str.split("/");
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date(str);
  }
});