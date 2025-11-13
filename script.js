// ---INTEGRACIÓN AIRTABLE---
const token = "patEqV2sPUQuOgfbP.d999c807bf015abc0f70feadf7a082e0de0080a36360ae7ee976f882d8466bda";
const baseID = "appdhZ2FVCDUuj4YT";
const baseUrl = `https://api.airtable.com/v0/${baseID}`;

async function obtenerDatos(tabla) {
  const url = `${baseUrl}/${tabla}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`}
  });
  const data = await response.json();
  return data.records.map(r => r.fields);
}

/*(async () => {
  const conciertos = await obtenerDatos("Conciertos");
  const favoritos = await obtenerDatos("Favoritos");
  const pantallaConciertos = await obtenerDatos("PantallaConciertos");

  console.log("Conciertos: ", conciertos);
  console.log("Favoritos: ", favoritos);
  console.log("Pantalla de Conciertos: ", pantallaConciertos);
})();*/

// ---MENÚ HAMBURGUESA---
const menuHamburguesa = document.getElementById('menuHamburguesa');
const menuU1 = document.querySelector('header nav ul');

menuHamburguesa.addEventListener('click', () => {
  menuU1.classList.toggle('show');
});

// ---CARTELERA---
async function cargarCartelera() {
  const pantallaConciertos = await obtenerDatos("PantallaConciertos");
  const contenedorCartelera = document.querySelector(".cartelera");
  const contenedorPuntos = document.querySelector(".dots");

  if (!contenedorCartelera) return;

  contenedorCartelera.innerHTML = "";
  if (contenedorPuntos) contenedorPuntos.innerHTML = "";

  pantallaConciertos.forEach((c, i) => {
    const slide = document.createElement("div");
    slide.className = "poster";
    if (i === 0) slide.classList.add("active");
    
    slide.innerHTML = `
      <a href = "${c.DetalleURL || '#'}" target = "_blank">
        <img src = "${c.Imagen[0]?.url || ''}" alt = "${c.NombreConcierto || ''}">
      </a>
    `;
    contenedorCartelera.appendChild(slide);

    if (contenedorPuntos) {
      const dot = document.createElement("span");
      dot.className = i === 0 ? "dot active" : "dot";
      dot.addEventListener("click", () => {
        showSlide(i);
      });
      contenedorPuntos.appendChild(dot);
    }
  });

  let current = 0;
  const slides = document.querySelectorAll(".poster");
  const puntos = document.querySelectorAll(".dot");

  function showSlide(index) {
    slides.forEach((slide, i) => slide.classList.toggle("active", i === index));
    puntos.forEach((dot, i) => dot.classList.toggle("active", i === index));
    current = index;
  }

  function nextSlide() {
    current = (current + 1) % slides.length;
    showSlide(current);
  }

  setInterval(nextSlide, 5000);
}

cargarCartelera();

// ---RENDERS---
document.addEventListener("DOMContentLoaded", async () => {
  const conciertos = await obtenerDatos("Conciertos");
  const favoritos = await obtenerDatos("Favoritos");
  const tickteras = await obtenerDatos("Ticketeras");

  console.log("Conciertos: ", conciertos);
  console.log("Favoritos: ", favoritos);
  console.log("Ticketeras: ", ticketeras);
})

// ---BUSCADOR---
fetch('buscador.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('cont-buscador').innerHTML = html;

      const form = document.getElementById('form-buscador');
      const artistaInput = document.getElementById('artista');
      const provinciaSelect = document.getElementById('provincia');
      const desdeInput = document.getElementById('fecha-desde');
      const hastaInput = document.getElementById('fecha-hasta');
      const fechaHoy = new Date().toISOString().split("T")[0];
      const modalBuscador = document.getElementById('modalBuscador');
      const btnAbrirBuscador = document.getElementById('abrirBuscador');
      const cerrarModalBuscador = modalBuscador.querySelector('#cerrar-modal-buscador');
      const modalResultados = document.getElementById('modalResultados');
      const cerrarResultadosX = modalResultados.querySelector('#cerrar-modal-resultados');
      const cerrarResultadosBtn = document.getElementById('cerrar-modal-boton');

      desdeInput?.setAttribute("min", fechaHoy);
      hastaInput?.setAttribute("min", fechaHoy);

      btnAbrirBuscador.addEventListener('click', e => {
        e.preventDefault();
        modalBuscador.style.display = 'flex';
      });

      cerrarModalBuscador.addEventListener('click', () => modalBuscador.style.display = 'none');
      window.addEventListener('click', e => { if (e.target === modalBuscador) modalBuscador.style.display = 'none';});
      
      cerrarResultadosX?.addEventListener('click', () => {
        modalResultados.style.display = 'none';
      });
      cerrarResultadosBtn?.addEventListener('click', () => {
        modalResultados.style.display = 'none';
      });
      window.addEventListener('click', (e) => {
        if (e.target === modalResultados) modalResultados.style.display = 'none';
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const artista = artistaInput.value.trim().toLowerCase();
        const provincia = provinciaSelect.value.trim().toLowerCase();
        const fechaDesde = desdeInput.value;
        const fechaHasta = hastaInput.value;

        if (fechaDesde && fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)) {
          alert("La fecha final no puede ser menor a la fecha inicial.");
          return;
        }

        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta) : null;

        const resultados = conciertos.filter(c => {
          const fechaEvento = parseFecha(c.Fecha);
          return (
            (!artista || (c.Artista?.toLowerCase().includes(artista))) &&
            (provincia === "todas" || (c.Provincia?.toLowerCase() === provincia)) &&
            (!desde || fechaEvento >= desde) &&
            (!hasta || fechaEvento <= hasta)
          );
        });

        const resultadosContainer = document.getElementById("resultados-buscador");
        resultadosContainer.innerHTML = "";

        if (resultados.length === 0) {
          resultadosContainer.innerHTML = "<p>No se encontraron conciertos con esos filtros.</p>";
        } else {
          resultados.forEach(c => {
            const div = document.createElement("div");
            div.className = "evento";
            div.innerHTML = `
              <h3>${c.Artista || "Artista sin nombre"}</h3>
              <p>${c.Provincia || "Provincia no especificada"} - ${formatoDDMMYYYY(c.Fecha) || "Fecha no especificada"}</p>
              <a href="${c.URL || '#'}" target="_blank">Comprar entradas</a>
              <button class = "btn-favorito">Agregar a Favoritos</button>
            `;
            resultadosContainer.appendChild(div);

            const botonFav = div.querySelector('btn-favorito');
            botonFav.addEventListener('click', async () => {
              const nombreUsuario = localStorage.getItem("nombreUsuario");

              if (!nombreUsuario) {
                alert("Para agregar a Favoritos necesitás registrarte o iniciar sesión.");
                return;
              }

              const datos = {
                ID_Concierto: c.ID_Concierto || "Sin ID",
                NombreUsuario: nombreUsuario,
                ImagenConcierto: [
                  { url: c.Imagen[0]?.url || "https:/via.placeholder.com/150" }
                ],
                Ticketera: c.URL || "",
                FechaGuardado: new Date().toISOString().split('T')[0]
              };

              try {
                const res = await agregarAFavoritos(datos);
                console.log("Favorito agregado: ", res);
                alert(`${c.NombreConcierto} se agregó a tus Favoritos`);
              } catch (error) {
                console.error("Error al agregar Favorito: ", error);
              }
            })
          });
        }
        modalResultados.style.display = "flex",
        modalBuscador.style.display = "none";
      });
  })
  .catch(err => console.log('Error al cargar el buscador: ', err));

  function parseFecha(str) {
    if (!str) return null;
    return new Date(str);
  }

  function formatoDDMMYYYY(str) {
    if(!str) return "";
    const fecha = new Date(str);
    return fecha.toLocaleDateString("es-AR");
  }

// --FAVORITOS
async function agregarAFavoritos(datosFavorito) {
  try {
    const response = await fetch('/api/crearRegistro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({ datos: datosFavorito })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error al agregar Favorito: ', error);
  }
}

const contenedorFav = document.querySelector(".favoritos-usuario");
if (contenedorFav) {
  favoritos.forEach(f => {
    const card = document.createElement("div");
    card.innerHTML = `
    <a href = "${f.URL}" target = "_blank">
    <img src = "${f.Imagen[0]?.url}" alt = "${f.NombreConcierto || ''}">
    </a>
    <p>${f.NombreConcierto || "Favorito sin nombre"}</p>
    `;
    contenedorFav.appendChild(card);
  });
}

// --TICKETERAS
const contenedorTick = document.querySelector(".ticketeras-principales");
if (contenedorTick) {
  ticketeras.forEach(t => {
    const card = document.createElement("div");
    card.innerHTML = `
    <a href = "${t.URL}" target = "_blank">
      <img src = "${f.Imagen[0]?.url}" alt = "${f.NombreConcierto || ''}">
    </a>
    <p>${f.NombreConcierto || ''}</p>
    `;
    contenedorTick.appendChild(card);
  });
}