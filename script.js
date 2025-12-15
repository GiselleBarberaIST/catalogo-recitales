/* ---CONFIGURACIÓN AIRTABLE--- */
const token = "patJWZQqYXMTpShDC.0f14d4ce0548208e7d1e8dbc105c868c64803fdd0c5e3bccb39763a29d1868a0";
const baseID = "appdhZ2FVCDUuj4YT";
const baseUrl = `https://api.airtable.com/v0/${baseID}`;

/* ---FUNCIONES GENERALES--- */
async function obtenerDatos(tabla) {
  try {
    const res = await fetch(`${baseUrl}/${tabla}`, {
      headers: { Authorization: `Bearer ${token}`}
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    console.log(`Datos de ${tabla}:`, data.records);
    return data.records;
  } catch (err) {
    console.error("Error al conectar con Airtable:", err);
    return [];
  }
}

/* ---PRUEBA DE CONEXIÓN---
document.addEventListener("DOMContentLoaded", async () => {
  await obtenerDatos("Conciertos");
  await obtenerDatos("Ticketeras");
});*/

/* ---MENÚ HAMBURGUESA--- */
const menuHamburguesa = document.getElementById('menuHamburguesa');
const menuU1 = document.querySelector('header nav ul');

if (menuHamburguesa && menuU1) {
  menuHamburguesa.addEventListener('click', () => {
    menuU1.classList.toggle('show');
  });
}

/* ---CARTELERA--- */
document.addEventListener("DOMContentLoaded", async () => {
  const cartelera = document.getElementById("cartelera");
  if(!cartelera) return;

  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const dotsContainer = document.getElementById("cartelera-dots");

  const conciertos = await obtenerDatos("Conciertos");
  const primeros6 = conciertos.slice(0, 6);
  let currentIndex = 0;

  primeros6.forEach((concierto, i) => {
    const urlImagen = concierto.fields.ImagenConcierto?.[0]?.url || "placeholder.png";
    const urlTicketera = concierto.fields.Ticketera || "#";
    
    const card = document.createElement("div");
    card.className = "cardConcierto";
    if (i === 0) card.classList.add("active");

    const img = document.createElement("img");
    img.src = urlImagen;
    img.alt = concierto.fields.NombreConcierto || "Sin nombre";

    img.addEventListener("click", () => window.open(urlTicketera, "_blank"));

    card.appendChild(img);
    cartelera.appendChild(card);

    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      showSlide(i);
      resetAutoSlide();
    });
    dotsContainer.appendChild(dot);
  });

  const slides = cartelera.querySelectorAll(".cardConcierto");
  const dots = dotsContainer.querySelectorAll("span");

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
    currentIndex = index;
  }

  prevBtn.addEventListener("click", () => {
    showSlide((currentIndex - 1 + slides.length) % slides.length);
    resetAutoSlide();
  });

  nextBtn.addEventListener("click", () => {
    showSlide((currentIndex + 1) % slides.length);
    resetAutoSlide();
  });

  let autoSlideInterval = setInterval(() => {
    showSlide((currentIndex + 1) % slides.length);
  }, 4000);

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      showSlide((currentIndex + 1) % slides.length);
    }, 4000);
  }
});

/* ---FAVORITOS--- */
function obtenerFavoritos() {
  const favoritos = localStorage.getItem("favoritos");
  return favoritos ? JSON.parse(favoritos) : [];
}

function guardarFavoritos(favoritos) {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

async function obtenerConciertoPorId(id) {
  try {
    const res = await fetch (`${baseUrl}/Conciertos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error(`Error al obtener concierto ${id}: `, res.status, res.statusText);
      return null;
    }

    const data = await res.json();

    return {
      id: data.id,
      nombre: data.fields.NombreConcierto || "Sin Nombre",
      imagen: data.fields.ImagenConcierto?.[0]?.url || "placeholder.jpg"
    };
  } catch (error) {
    console.error("Error al obtener concierto: ", error);
    return null;
  }
}

async function mostrarFavoritos() {
  const favoritos = obtenerFavoritos();
  console.log("Favoritos guardados en LocalStorage: ", favoritos);

  const contenedor = document.getElementById("favoritosContainer");
  if (!contenedor) return;

  if (favoritos.length === 0) {
    contenedor.innerHTML = `
    <p class="mensaje-vacio">
      Todavía no agregaste nada a tus Favoritos. <br>
    </p>`;
    return;
  }

  contenedor.innerHTML = "<p>Cargando favoritos...</p>";

  let conciertos = await Promise.all(
    favoritos.map(id => obtenerConciertoPorId(id))
  );

  conciertos = conciertos.filter(c => c !== null);

  contenedor.innerHTML = conciertos.map(concierto => `
    <div class="card-favorito">
      <img src="${concierto.imagen}"
        alt="${concierto.nombre}"
        class="img-favorito"
        data-id="${concierto.id}" />
      
      <div class="info-favorito">
        <h3>${concierto.nombre}</h3>

        <button class="btn-quitar" data-id="${concierto.id}">
          Quitar de Favoritos
        </button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".btn-quitar").forEach(btn => {
    btn.addEventListener("click", e => {
      quitarDeFavoritos(e.target.dataset.id);
    });
  });

  document.querySelectorAll(".img-favorito").forEach(img => {
    img.addEventListener("click", e => {
      window.location.href = `detalle_concierto.html?id=${e.target.dataset.id}`;
    });
  });
}

function quitarDeFavoritos(id) {
  const favoritos = obtenerFavoritos();
  const filtrados = favoritos.filter(favId => favId !== id);
  guardarFavoritos(filtrados);
  mostrarFavoritos();
}

/* ---CONCIERTOS--- */
async function cargarConciertosEnPantalla() {
  const grid = document.querySelector(".grid-conciertos");
  const conciertos = await obtenerDatos("Conciertos");

  grid.innerHTML = "";

  conciertos.forEach(concierto => {
    const imagen = concierto.fields.ImagenConcierto
      ? concierto.fields.ImagenConcierto[0].url
      : "ImagenesProyecto/placeholder.png";

    const id = concierto.id;

    const card = document.createElement("div");
    card.classList.add("concierto-card");

    card.innerHTML = `<img src="${imagen}" alt="${concierto.fields.NombreConcierto}" />`;

    card.addEventListener("click", () => {
      window.location.href = `detalle_concierto.html?id=${id}`;
    });

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", cargarConciertosEnPantalla);

/* ---DETALLE DEL CONCIERTO--- */
document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("detalleConcierto");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    contenedor.innerHTML = "<p>No se recibió un ID válido del concierto.</p>";
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/Conciertos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const data = await res.json();
    const fields = data.fields;

    const imagen = fields.ImagenConcierto?.[0]?.url || "ImagenesProyecto/placeholder.png";
    const nombre = fields.NombreConcierto || "Concierto sin nombre";
    const desc = fields.Descripción || "Descripción no disponible";
    const ticket = fields.Ticketera || "#";

    const favoritos = obtenerFavoritos();
    let esFavorito = favoritos.includes(id);

    contenedor.innerHTML = `
      <div class="detalle-card">
        <img class="detalle-img" src="${imagen}" alt="${nombre}" />
        <h2 class="detalle-titulo">${nombre}</h2>
        <p class="detalle-descripcion">${desc}</p>
        <div class="detalle-botones">
          <a href="${ticket}" target="_blank" class="btn-entradas">Comprar Entradas</a>
          <button id="btnFavorito" class="btn-favorito">
            ${esFavorito ? "Quitar de Favoritos" : "Agregar a Favoritos"}
          </button>
        </div>
      </div>
    `;

const btnFavorito = document.getElementById("btnFavorito");

    function actualizarBoton() {
      if (esFavorito) {
        btnFavorito.textContent = "Quitar de Favoritos";
        btnFavorito.classList.remove("agregar");
        btnFavorito.classList.add("quitar");
      } else {
        btnFavorito.textContent = "Agregar a Favoritos";
        btnFavorito.classList.remove("quitar");
        btnFavorito.classList.add("agregar");
      }
    }

    actualizarBoton();

    btnFavorito.addEventListener("click", () => {
      let favoritosActualizados = obtenerFavoritos();

      if (esFavorito) {
        const index = favoritosActualizados.indexOf(id);
        if (index > -1) favoritosActualizados.splice(index, 1);
        esFavorito = false;
      } else {
        favoritosActualizados.push(id);
        esFavorito = true;
      }

      guardarFavoritos(favoritosActualizados);
      actualizarBoton();
    });

  } catch (error) {
    console.error("Error al cargar el detalle del concierto:", error);
    contenedor.innerHTML = "<p>No se pudo cargar el concierto. Intente nuevamente más tarde.</p>";
  }
});

/* ---BUSCADOR--- */
document.addEventListener("DOMContentLoaded", () => {
  const formBuscador = document.getElementById("form-buscador");
  const artistaInput = document.getElementById("artista");
  const provinciaSelect = document.getElementById("provincia");
  const fechaDesdeInput = document.getElementById("fecha-desde");
  const fechaHastaInput = document.getElementById("fecha-hasta");
  const resultadosDiv = document.getElementById("resultados-buscador");
  const limpiarBtn = document.getElementById("limpiar-filtros");
  const tituloResultados = document.querySelector(".resultados-section h3");
  const mensajeSinResultados = document.getElementById("mensaje-sinresultados");
  const mensajeFechaInv = document.getElementById("mensaje-fechainv");

  tituloResultados.style.display = "none";
  mensajeSinResultados.style.display = "none";
  mensajeFechaInv.style.display = "none";

  async function buscarConciertos(event) {
    if(event) event.preventDefault();
    resultadosDiv.innerHTML = "";
    const conciertos = await obtenerDatos("Conciertos");
    const artistaFiltro = artistaInput.value.trim().toLowerCase();
    const provinciaFiltro = provinciaSelect.value;
    const fechaDesde = fechaDesdeInput.value;
    const fechaHasta = fechaHastaInput.value;

    if(fechaDesde && fechaHasta && fechaDesde > fechaHasta){
      tituloResultados.style.display = "none";
      mensajeFechaInv.textContent = "La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.";
      mensajeFechaInv.style.display = "block";
      return;
    }

    let resultados = conciertos.filter(c => {
      const nombre = c.fields.NombreConcierto.toLowerCase();
      const lugar = c.fields.Lugar;
      const fecha = c.fields.Fecha;

      const coincideArtista = artistaFiltro === "" || nombre.includes(artistaFiltro);
      const coincideProvincia = provinciaFiltro === "todas" || lugar === provinciaFiltro;
      const coincideFechaDesde = !fechaDesde || fecha >= fechaDesde;
      const coincideFechaHasta = !fechaHasta || fecha <= fechaHasta;

      return coincideArtista && coincideProvincia && coincideFechaDesde && coincideFechaHasta;
    });

    if(resultados.length === 0){
      tituloResultados.style.display = "none";
      mensajeSinResultados.textContent = "No se encontraron resultados con los filtros aplicados";
      mensajeSinResultados.style.display = "block";
      return;
    }

    tituloResultados.style.display = "block";

    resultados.forEach(c => {
      const div = document.createElement("div");
      div.classList.add("resultado-card");
      div.innerHTML = `
        <img src="${c.fields.ImagenConcierto[0].url}" 
            alt="${c.fields.NombreConcierto}" 
            class="resultado-img">

        <h4>${c.fields.NombreConcierto}</h4>
        <p>${c.fields.Fecha} - ${c.fields.Lugar}</p>

        <div class="detalle-botones">
          <a href="${c.fields.Ticketera}" 
            target="_blank" 
            class="btn-entradas">
            Comprar Entradas
          </a>

          <button class="btn-favorito agregar">
            ${esFavorito(c.id) ? "Quitar de Favoritos" : "Agregar a Favoritos"}
          </button>
        </div>
      `;
      const btnFav = div.querySelector(".btn-favorito");
      btnFav.addEventListener("click", () => toggleFavorito(c.id, btnFav));
      resultadosDiv.appendChild(div);
    });
  }

  function esFavorito(id){
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    return favoritos.includes(id);
  }

  function toggleFavorito(id, btn){
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    if(favoritos.includes(id)){
      favoritos = favoritos.filter(f => f !== id);
      btn.textContent = "Agregar a Favoritos";
      btn.classList.remove("quitar");
      btn.classList.add("agregar");
    } else {
      favoritos.push(id);
      btn.textContent = "Quitar de Favoritos";
      btn.classList.remove("agregar");
      btn.classList.add("quitar");
    }
    
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
    btn.textContent = favoritos.includes(id) ? "Quitar de Favoritos" : "Agregar a Favoritos";
  }

  formBuscador.addEventListener("submit", buscarConciertos);
  limpiarBtn.addEventListener("click", () => {
    artistaInput.value = "";
    provinciaSelect.value = "todas";
    fechaDesdeInput.value = "";
    fechaHastaInput.value = "";
    resultadosDiv.innerHTML = "";
    tituloResultados.style.display = "none";
    mensajeFechaInv.style.display = "none";
    mensajeSinResultados.style.display = "none";
  });
});