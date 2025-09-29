// ---MENÚ HAMBURGUESA---
const menuHamburguesa = document.getElementById('menuHamburguesa');
const menuU1 = document.querySelector('header nav ul');

menuHamburguesa.addEventListener('click', () => {
  menuU1.classList.toggle('show');
});

// ---CARTELERA---
const carteleraDeslizable = document.querySelectorAll('.poster');
const puntos = document.querySelectorAll('.dot');
let current = 0;

function showSlide(index) {
  carteleraDeslizable.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    puntos[i].classList.toggle('active', i === index);
  });
}

function nextSlide() {
  current = (current + 1) % carteleraDeslizable.length;
  showSlide(current);
}

setInterval(nextSlide, 5000);

puntos.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    current = i;
    showSlide(current);
  });
});

// ---BUSCADOR---
document.addEventListener("DOMContentLoaded", () => { 

  let conciertos = [];
  fetch("conciertos.json")
    .then(response => response.json())
    .then(data => {
      conciertos = data;
      console.log("Conciertos cargados:", conciertos);
    })
    .catch(err => console.error("Error al cargar conciertos:", err));

  fetch('buscador.html')
    .then(response => response.text())
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
      
      desdeInput?.setAttribute("min", fechaHoy);
      hastaInput?.setAttribute("min", fechaHoy);

      btnAbrirBuscador.addEventListener('click', (e) => {
        e.preventDefault();
        modalBuscador.style.display = 'flex';
      });

      cerrarModalBuscador.addEventListener('click', () => {
        modalBuscador.style.display = 'none';
      });

      window.addEventListener('click', (e) => {
        if(e.target === modalBuscador) modalBuscador.style.display = 'none';
      });

      const modalResultados = document.getElementById('modalResultados');
      const cerrarResultadosX = modalResultados.querySelector('#cerrar-modal-resultados');
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
          const fechaEvento = parseFecha(c.fecha);
          return (
            (!artista || (c.artista && c.artista.toLowerCase().includes(artista))) &&
            (provincia === "todas" || (c.provincia && c.provincia.toLowerCase() === provincia)) &&
            (!desde || fechaEvento >= desde) &&
            (!hasta || fechaEvento <= hasta)
          );
        });

          cerrarModalBuscador.addEventListener('click', () => {
            modalBuscador.style.display = 'none';
          });

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
              <p>📍 ${c.provincia || "Provincia no especificada"} - ${formatoDDMMYYYY(c.fecha) || "Fecha no especificada"}</p>
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

  function parseFecha(str) {
    if (!str) return null;
    if (str.includes("/")) {
      const [m, d, y] = str.split("/");
      return new Date(`${y}-${m}-${d}`);
    }
    return new Date(str);
  }

  function formatoDDMMYYYY(str) {
    if (!str) return "";
    const [m, d, y] = str.split("/");
    return `${d}/${m}/${y}`;
  }
});

// --FAVORITOS
fetch("favoritos.json")
.then(response => response.json())
.then(data => {
    const contenedor = document.querySelector(".favoritos-usuario");

    data.forEach(artista => {
        const card = document.createElement("div");

        const url = document.createElement("a");
        url.href = artista.url;
        url.target = "_blank";

        const img = document.createElement("img");
        img.src = artista.imagen;
        img.alt = artista.nombre;

        url.appendChild(img);

        const nombre = document.createElement("p");
        nombre.textContent = artista.nombre;

        card.appendChild(url);
        card.appendChild(nombre);

        contenedor.appendChild(card);
    })
})
.catch(error => console.error("Error: ", error));

// --TICKETERAS
fetch("ticketeras.json")
.then(response => response.json())
.then(data => {
    const contenedor = document.querySelector(".ticketeras-principales");

    data.forEach(artista => {
        const card = document.createElement("div");

        const url = document.createElement("a");
        url.href = artista.url;
        url.target = "_blank";

        const img = document.createElement("img");
        img.src = artista.imagen;
        img.alt = artista.nombre;

        url.appendChild(img);

        const nombre = document.createElement("p");
        nombre.textContent = artista.nombre;

        card.appendChild(url);
        card.appendChild(nombre);

        contenedor.appendChild(card);
    })
})
.catch(error => console.error("Error: ", error));