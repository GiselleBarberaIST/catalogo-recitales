
const params = new URLSearchParams(window.location.search);
const idConcierto = params.get("id");

async function mostrarDetalle() {
  const conciertos = await obtenerDatos("Conciertos");
  const concierto = conciertos.find(c => c.id === idConcierto);

  if (!concierto) return;

  document.getElementById("detalle-imagen").src = concierto.fields.ImagenConcierto[0].url;
  document.getElementById("detalle-nombre").textContent = concierto.fields.NombreConcierto;
  document.getElementById("detalle-descripcion").textContent = concierto.fields.Descripcion;
  document.getElementById("detalle-ticketera").href = concierto.fields.Ticketera;
  
const btnFav = document.getElementById("btn-fav");

let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

function actualizarBoton() {
  if (favoritos.includes(idConcierto)) {
    btnFav.textContent = "Quitar de Favoritos";
    btnFav.classList.add("en-favoritos");
  } else {
    btnFav.textContent = "Agregar a Favoritos";
    btnFav.classList.remove("en-favoritos");
  }
}

btnFav.addEventListener("click", () => {
  if (favoritos.includes(idConcierto)) {
    favoritos = favoritos.filter(id => id !== idConcierto);
  } else {

    favoritos.push(idConcierto);
  }
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  actualizarBoton();
});

actualizarBoton();

}

document.addEventListener("DOMContentLoaded", mostrarDetalle);