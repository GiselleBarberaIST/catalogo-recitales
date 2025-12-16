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

function generarIDUsuario() {
  return "USR-" + Date.now();
}

function mostrarMensaje(texto, tipo = "error") {
  const msg = document.getElementById("auth-message");
  if (!msg) return;

  msg.textContent = texto;
  msg.className = `auth-message ${tipo}`;
  msg.classList.remove("hidden");
}

async function usuarioExiste(usuario) {
  const usuarios = await obtenerDatos("Usuarios");
  const usuarioLower = usuario.toLowerCase();

  return usuarios.some(u => {
    const nombreUsuario = u.fields.NombreUsuario?.toLowerCase();
    return nombreUsuario === usuarioLower;
  });
}

async function emailExiste(email) {
  const usuarios = await obtenerDatos("Usuarios");
  const emailLower = email.toLowerCase();

  return usuarios.some(u => {
    const emailUsuario = u.fields.Email?.toLowerCase();
    return emailUsuario === emailLower;
  });
}

async function buscarUsuarioLogin(identificador, password) {
  const usuarios = await obtenerDatos("Usuarios");

  return usuarios.find(u => {
    const fields = u.fields;

    const email = fields.Email?.toLowerCase();
    const nombreUsuario = fields.NombreUsuario?.toLowerCase();

    const identificadorLower = identificador.toLowerCase();

    const coincideUsuario = email === identificadorLower || nombreUsuario === identificadorLower;

    return coincideUsuario && fields.Password === password;
  });
}

function actualizarPagina() {
  const modal = document.getElementById("modal-toggle");
  if (modal) modal.checked = false;
  window.location.reload();
}

/* ---PRUEBA DE CONEXIÓN---
document.addEventListener("DOMContentLoaded", async () => {
  await obtenerDatos("Conciertos");
  await obtenerDatos("Ticketeras");
});*/

/* ---FUNCIÓN MAESTRA MANEJO SESIÓN--- */
function mostrarIconoPerfil() {
  const nav = document.querySelector("nav ul");
  if(!nav || document.getElementById("perfil-usuario")) return;

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
  if (!usuario) return;

  let contenidoPerfil = "👤";

  if (
    usuario.ImagenPerfil &&
    Array.isArray(usuario.ImagenPerfil) &&
    usuario.ImagenPerfil.length > 0
  ) {
    const urlImagen = usuario.ImagenPerfil[0].url;
    contenidoPerfil = `
      <img
        src="${urlImagen}"
        alt="Perfil"
        class="avatar-perfil"
      />
    `;
  }

  const li = document.createElement("li");
  li.id = "perfil-usuario";
  li.innerHTML = `
    <a href="profile.html" title="Mi perfil">
      ${contenidoPerfil}
    </a>
  `;

  nav.appendChild(li);
}

function manejarSesionUI() {
  const usuario = sessionStorage.getItem("usuarioLogueado");

  const btnAuth = document.querySelector(".btn-header");
  const linkFavoritos = document.querySelector('a[href="favoritos.html"]')?.parentElement;

  if (usuario) {
    if (btnAuth) btnAuth.style.display = "none";
    if (linkFavoritos) linkFavoritos.style.display = "block";

    mostrarIconoPerfil();
  } else {
    if (btnAuth) btnAuth.style.display = "inline-block";
    if (linkFavoritos) linkFavoritos.style.display = "none";
  }
}

/* ---MENÚ HAMBURGUESA--- */
const menuHamburguesa = document.getElementById('menuHamburguesa');
const menuU1 = document.querySelector('header nav ul');

if (menuHamburguesa && menuU1) {
  menuHamburguesa.addEventListener('click', () => {
    menuU1.classList.toggle('show');
  });
}

/* ---REGISTRO/LOGIN--- */
async function crearUsuario(usuario) {
  try {
    const res = await fetch(`${baseUrl}/Usuarios`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: usuario
      })
    });

    if (!res.ok) throw new Error("Error al crear el Usuario");

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return null;
  }
}

const signupForm = document.querySelector(".signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre-signup").value.trim();
    const apellido = document.getElementById("apellido-signup").value.trim();
    const nombreUsuario = document.getElementById("nombreusuario-signup").value;
    const email = document.getElementById("email-signup").value.trim();
    const password = document.getElementById("password-signup").value;
    const confirmPassword = document.getElementById("confirm-password-signup").value;

    if (password !== confirmPassword) {
      mostrarMensaje("Las contraseñas no coinciden");
      return;
    }

    if (await usuarioExiste(nombreUsuario)) {
      mostrarMensaje("Ese usuario ya se encuentra registrado");
      return;
    }

    if (await emailExiste(email)) {
      mostrarMensaje("Ese email ya está registrado");
      return;
    }
          
    const nuevoUsuario = {
      ID_Usuario: generarIDUsuario(),
      Nombre: nombre,
      Apellido: apellido,
      NombreUsuario: nombreUsuario,
      Email: email,
      Password: password,
    };

    const resultado = await crearUsuario(nuevoUsuario);

    if (resultado) {
      nuevoUsuario.recordId = resultado.id;
      sessionStorage.setItem("usuarioLogueado", JSON.stringify(nuevoUsuario));
      mostrarMensaje("Registro exitoso", "success");
      actualizarPagina();
    }
  });
}

const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identificador = document.getElementById("login-identifier").value.trim();
    const password = document.getElementById("password-login").value;

    const usuario = await buscarUsuarioLogin(identificador, password);

    if (!usuario) {
      mostrarMensaje("Usuario o contraseña incorrectos");
      return;
    }

    const usuarioLogueado = {
      ID_Usuario: usuario.fields.ID_Usuario,
      Nombre: usuario.fields.Nombre,
      Apellido: usuario.fields.Apellido,
      NombreUsuario: usuario.fields.NombreUsuario,
      Email: usuario.fields.Email,
      Password: usuario.fields.Password,
      recordId: usuario.id
    };

    sessionStorage.setItem(
      "usuarioLogueado",
      JSON.stringify(usuarioLogueado)
    );

    mostrarMensaje("Sesión iniciada correctamente", "success");
    actualizarPagina();
  });
}

const cerrarModalBtn = document.getElementById("cerrar-modal");
const modalToggle = document.getElementById("modal-toggle");
const switchFormToggle = document.getElementById("switch-form-toggle");

if (cerrarModalBtn) {
  cerrarModalBtn.addEventListener("click", () => {
    modalToggle.checked = false;
    switchFormToggle.checked = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  manejarSesionUI();
});

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

/* ---MOSTRAR FAVORITOS--- */
async function obtenerConciertoPorId(id) {
  try {
    const res = await fetch(`${baseUrl}/Conciertos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error(`Error al obtener concierto ${id}:`, res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return {
      id: data.id,
      nombre: data.fields.NombreConcierto || "Sin nombre",
      imagen: data.fields.ImagenConcierto?.[0]?.url || "placeholder.jpg"
    };
  } catch (error) {
    console.error("Error al obtener concierto:", error);
    return null;
  }
}

async function mostrarFavoritos() {
  const favoritos = obtenerFavoritos();
  const contenedor = document.getElementById("favoritosContainer");
  if (!contenedor) return;

  if (favoritos.length === 0) {
    contenedor.innerHTML = `<p class="mensaje-vacio">Todavía no agregaste nada a tus Favoritos.</p>`;
    return;
  }

  contenedor.innerHTML = "<p>Cargando favoritos...</p>";

  let conciertos = await Promise.all(
    favoritos.map(id => obtenerConciertoPorId(id))
  );

  conciertos = conciertos.filter(c => c !== null);

  contenedor.innerHTML = conciertos.map(concierto => `
    <div class="card-favorito">
      <img src="${concierto.imagen}" alt="${concierto.nombre}" class="img-favorito" data-id="${concierto.id}" />
      <div class="info-favorito">
        <h3>${concierto.nombre}</h3>
        <button class="btn-quitar" data-id="${concierto.id}">
          Quitar de Favoritos
        </button>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".btn-quitar").forEach(btn => {
    btn.addEventListener("click", e => toggleFavorito(e.target.dataset.id, btn));
  });

  document.querySelectorAll(".img-favorito").forEach(img => {
    img.addEventListener("click", e => {
      window.location.href = `detalle_concierto.html?id=${e.target.dataset.id}`;
    });
  });
}

document.addEventListener("DOMContentLoaded", mostrarFavoritos);

/* ---FAVORITOS POR USUARIO--- */
function obtenerUsuarioLogueado() {
  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
  return usuario || null;
}

function obtenerFavoritos() {
  const usuario = obtenerUsuarioLogueado();
  if (!usuario) return [];
  const key = `favoritos_${usuario.ID_Usuario}`;
  const favoritos = localStorage.getItem(key);
  return favoritos ? JSON.parse(favoritos) : [];
}

function guardarFavoritos(favoritos) {
  const usuario = obtenerUsuarioLogueado();
  if (!usuario) return;
  const key = `favoritos_${usuario.ID_Usuario}`;
  localStorage.setItem(key, JSON.stringify(favoritos));
}

function esFavorito(id) {
  return obtenerFavoritos().includes(id);
}

function toggleFavorito(id, btn) {
  const usuario = obtenerUsuarioLogueado();
  if (!usuario) {
    mostrarMensaje("Debés iniciar sesión para agregar favoritos", "error");
    const modalToggle = document.getElementById("modal-toggle");
    if (modalToggle) modalToggle.checked = true;
    return;
  }

  let favoritosActualizados = obtenerFavoritos();
  if (favoritosActualizados.includes(id)) {
    favoritosActualizados = favoritosActualizados.filter(favId => favId !== id);
    mostrarMensaje("Concierto eliminado de Favoritos", "success");
  } else {
    favoritosActualizados.push(id);
    mostrarMensaje("Concierto agregado a Favoritos", "success");
  }

  guardarFavoritos(favoritosActualizados);

  if (btn) {
    btn.textContent = favoritosActualizados.includes(id)
      ? "Quitar de Favoritos"
      : "Agregar a Favoritos";
    btn.classList.toggle("agregar");
    btn.classList.toggle("quitar");
  }

  if (document.getElementById("favoritosContainer")) {
    mostrarFavoritos();
  }
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
  if (!contenedor) return;

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

    contenedor.innerHTML = `
      <div class="detalle-card">
        <img class="detalle-img" src="${imagen}" alt="${nombre}" />
        <h2 class="detalle-titulo">${nombre}</h2>
        <p class="detalle-descripcion">${desc}</p>
        <div class="detalle-botones">
          <a href="${ticket}" target="_blank" class="btn-entradas">Comprar Entradas</a>
          <button id="btnFavorito" class="btn-favorito ${
            esFavorito(id) ? "quitar" : "agregar"
          }">
            ${esFavorito(id) ? "Quitar de Favoritos" : "Agregar a Favoritos"}
          </button>
        </div>
      </div>
    `;

    const btnFavorito = document.getElementById("btnFavorito");
    if (btnFavorito) {
      btnFavorito.addEventListener("click", () => toggleFavorito(id, btnFavorito));
    }

  } catch (error) {
    console.error("Error al cargar el detalle del concierto:", error);
    contenedor.innerHTML = "<p>No se pudo cargar el concierto. Intente nuevamente más tarde.</p>";
  }
});

/* ---BUSCADOR--- */
document.addEventListener("DOMContentLoaded", () => {
  const formBuscador = document.getElementById("form-buscador");
  if (!formBuscador) return;

  const artistaInput = document.getElementById("artista");
  const provinciaSelect = document.getElementById("provincia");
  const fechaDesdeInput = document.getElementById("fecha-desde");
  const fechaHastaInput = document.getElementById("fecha-hasta");
  const resultadosDiv = document.getElementById("resultados-buscador");
  const limpiarBtn = document.getElementById("limpiar-filtros");
  const tituloResultados = document.querySelector(".resultados-section h3");
  const mensajeSinResultados = document.getElementById("mensaje-sinresultados");
  const mensajeFechaInv = document.getElementById("mensaje-fechainv");

  function limpiarMensajes() {
    if(tituloResultados) tituloResultados.style.display = "none";
    if(mensajeSinResultados) mensajeSinResultados.style.display = "none";
    if(mensajeFechaInv) mensajeFechaInv.style.display = "none";
  }

  async function buscarConciertos(event) {
    if(event) event.preventDefault();
    limpiarMensajes();
    resultadosDiv.innerHTML = "";

    const conciertos = await obtenerDatos("Conciertos");
    const artistaFiltro = artistaInput.value.trim().toLowerCase();
    const provinciaFiltro = provinciaSelect.value;
    const fechaDesde = fechaDesdeInput.value;
    const fechaHasta = fechaHastaInput.value;

    if(fechaDesde && fechaHasta && fechaDesde > fechaHasta){
      if(mensajeFechaInv){
        mensajeFechaInv.textContent = "La fecha 'Desde' no puede ser posterior a la fecha 'Hasta'.";
        mensajeFechaInv.style.display = "block";
      }
      return;
    }

    const resultados = conciertos.filter(c => {
      const nombre = c.fields.NombreConcierto.toLowerCase();
      const lugar = c.fields.Lugar;
      const fecha = c.fields.Fecha;

      return (artistaFiltro === "" || nombre.includes(artistaFiltro)) &&
             (provinciaFiltro === "todas" || lugar === provinciaFiltro) &&
             (!fechaDesde || fecha >= fechaDesde) &&
             (!fechaHasta || fecha <= fechaHasta);
    });

    if(resultados.length === 0){
      if(mensajeSinResultados){
        mensajeSinResultados.textContent = "No se encontraron resultados con los filtros aplicados";
        mensajeSinResultados.style.display = "block";
      }
      return;
    }

    if(tituloResultados) tituloResultados.style.display = "block";

    resultados.forEach(c => {
      const div = document.createElement("div");
      div.classList.add("resultado-card");
      div.innerHTML = `
        <img src="${c.fields.ImagenConcierto?.[0]?.url || 'placeholder.jpg'}"
            alt="${c.fields.NombreConcierto}" 
            class="resultado-img">

        <h4>${c.fields.NombreConcierto}</h4>
        <p>${c.fields.Fecha} - ${c.fields.Lugar}</p>

        <div class="detalle-botones">
          <a href="${c.fields.Ticketera}" target="_blank" class="btn-entradas">Comprar Entradas</a>
          <button class="btn-favorito ${esFavorito(c.id) ? 'quitar' : 'agregar'}">
            ${esFavorito(c.id) ? "Quitar de Favoritos" : "Agregar a Favoritos"}
          </button>
        </div>
      `;

      const btnFav = div.querySelector(".btn-favorito");
      if(btnFav) btnFav.addEventListener("click", () => toggleFavorito(c.id, btnFav));

      resultadosDiv.appendChild(div);
    });
  }

  formBuscador.addEventListener("submit", buscarConciertos);

  if(limpiarBtn){
    limpiarBtn.addEventListener("click", () => {
      artistaInput.value = "";
      provinciaSelect.value = "todas";
      fechaDesdeInput.value = "";
      fechaHastaInput.value = "";
      resultadosDiv.innerHTML = "";
      limpiarMensajes();
    });
  }
});

/* ---PERFIL DE USUARIO--- */
document.addEventListener("DOMContentLoaded", () => {
  const esPerfil = document.body.dataset.page === "perfil";
  if (!esPerfil) return;

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
  if (!usuario) {
    console.warn("No hay usuario en sessionStorage");
    return;
  }

  document.getElementById("perfil-usuario").textContent = `${usuario.NombreUsuario}`;
  document.getElementById("perfil-nombre").textContent = usuario.Nombre;
  document.getElementById("perfil-apellido").textContent = usuario.Apellido;
  document.getElementById("perfil-email").textContent = usuario.Email;

  document.getElementById("logout-btn").addEventListener("click", () => {
    sessionStorage.removeItem("usuarioLogueado");
    window.location.href = "index.html";
  });

  document.getElementById("delete-user-btn").addEventListener("click", async () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado"));
    if (!usuario?.recordId) { mostrarMensaje("Usuario inválido"); return; }
    if (!confirm("Esta acción es irreversible. ¿Deseás eliminar tu usuario?")) return;

    try {
      const res = await fetch(`${baseUrl}/Usuarios/${usuario.recordId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No se pudo eliminar el usuario");

      sessionStorage.removeItem("usuarioLogueado");
      window.location.href = "index.html";
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al eliminar usuario");
    }
  });

  const btnChangePassword = document.getElementById("change-password-btn");
  const sectionChangePassword = document.getElementById("change-password-section");

  btnChangePassword.addEventListener("click", () => {
    sectionChangePassword.classList.toggle("hidden");
  });

  document.getElementById("save-password-btn").addEventListener("click", async () => {
    const usuario = JSON.parse(sessionStorage.getItem("usuarioLogueado")); // Instanciar dentro del listener
    if (!usuario?.recordId) { mostrarMensaje("Usuario inválido"); return; }

    const nuevaPassword = document.getElementById("new-password").value.trim();
    const confirmPassword = document.getElementById("confirm-new-password").value.trim();

    if (!nuevaPassword || !confirmPassword) { mostrarMensaje("Completá ambos campos"); return; }
    if (nuevaPassword !== confirmPassword) { mostrarMensaje("Las contraseñas no coinciden"); return; }

    try {
      const res = await fetch(`${baseUrl}/Usuarios/${usuario.recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fields: { Password: nuevaPassword } })
      });
      if (!res.ok) throw new Error("Error al actualizar contraseña");

      mostrarMensaje("Contraseña actualizada correctamente", "success");
      sectionChangePassword.classList.add("hidden");
    } catch (error) {
      console.error(error);
      mostrarMensaje("No se pudo cambiar la contraseña");
    }
  });
});

/* ---TICKETERAS--- */

document.addEventListener("DOMContentLoaded", () => {
  const contenedorTicketeras = document.querySelector(".ticketeras-principales");
  if (!contenedorTicketeras) return;

  cargarTicketeras();
});

async function cargarTicketeras() {
  try {
    const res = await fetch(`${baseUrl}/Ticketeras`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Error al obtener ticketeras");

    const data = await res.json();
    renderTicketeras(data.records);
  } catch (error) {
    console.error(error);
    mostrarMensaje("No se pudieron cargar las ticketeras");
  }
}

function renderTicketeras(ticketeras) {
  const contenedor = document.querySelector(".ticketeras-principales");
  contenedor.innerHTML = "";

  ticketeras.forEach(ticketera => {
    const { NombreTicketera, ImagenTicketera, URL_Ticketera } = ticketera.fields;

    if (!ImagenTicketera || !URL_Ticketera) return;

    const imagenUrl = ImagenTicketera[0].url;

    const link = document.createElement("a");
    link.href = URL_Ticketera;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.classList.add("ticketera-card");

    const img = document.createElement("img");
    img.src = imagenUrl;
    img.alt = NombreTicketera;

    link.appendChild(img);
    contenedor.appendChild(link);
  });
}