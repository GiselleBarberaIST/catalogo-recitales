// ---CONFIGURACIÓN AIRTABLE---
const token = "patJWZQqYXMTpShDC.0f14d4ce0548208e7d1e8dbc105c868c64803fdd0c5e3bccb39763a29d1868a0";
const baseID = "appdhZ2FVCDUuj4YT";
const baseUrl = `https://api.airtable.com/v0/${baseID}`;

async function obtenerDatos(tabla) {
  try {
    const res = await fetch(`${baseUrl}/${tabla}`, {
      headers: { Authorization: `Bearer ${token}` }
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

// ---PRUEBA DE CONEXIÓN---
document.addEventListener("DOMContentLoaded", async () => {
  const conciertos = await obtenerDatos("Conciertos");
  const ticketeras = await obtenerDatos("Ticketeras");
});

// ---MENÚ HAMBURGUESA---
const menuHamburguesa = document.getElementById('menuHamburguesa');
const menuU1 = document.querySelector('header nav ul');

menuHamburguesa.addEventListener('click', () => {
  menuU1.classList.toggle('show');
});

// ---CARTELERA---
document.addEventListener("DOMContentLoaded", async () => {
  const conciertos = await obtenerDatos("Conciertos");

  const cartelera = document.getElementById("cartelera");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const dotsContainer = document.getElementById("cartelera-dots");

  if (!cartelera) return;

  const primeros6 = conciertos.slice(0,6);
  let currentIndex = 0;

  primeros6.forEach((concierto, i) => {
    const urlImagen = concierto.fields.ImagenConcierto?.[0]?.url || "placeholder.png";
    const urlTicketera = concierto.fields.Ticketera || "#";

    const card = document.createElement("div");
    card.className = "cardConcierto";
    if(i === 0) card.classList.add("active");

    const img = document.createElement("img");
    img.src = urlImagen;
    img.alt = concierto.fields.NombreConcierto || "Sin nombre";

    // Imagen clickeable
    img.addEventListener("click", () => {
      window.open(urlTicketera, "_blank");
    });

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