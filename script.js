const productos = [
    { nombre: "remera", precio: 15000 },
    { nombre: "buzo", precio: 25000 },
    { nombre: "pantalon", precio: 35000 },
    { nombre: "medias media caña", precio: 2500 },
    { nombre: "soquete", precio: 2000 },
    { nombre: "campera", precio: 50000 },
];

productos.forEach((producto) => {
    console.log(`${producto.nombre}: $${producto.precio}`);
});

const titulo = document.getElementById("titulo");
if (titulo) {
    console.log(titulo.textContent);
}

const WHATSAPP_TELEFONO = "5491123909541";

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(precio);
}

function obtenerPrecio(categoria, titulo) {
    const cat = categoria.toLowerCase();
    const tit = titulo.toLowerCase();

    if (cat.includes("remera")) {
        return productos.find((p) => p.nombre === "remera")?.precio;
    }
    if (cat.includes("buzo")) {
        return productos.find((p) => p.nombre === "buzo")?.precio;
    }
    if (cat.includes("pantalon")) {
        return productos.find((p) => p.nombre === "pantalon")?.precio;
    }
    if (cat.includes("campera")) {
        return productos.find((p) => p.nombre === "campera")?.precio;
    }
    if (cat.includes("media")) {
        if (tit.includes("soquete") && tit.includes("media")) {
            const soquete = productos.find((p) => p.nombre === "soquete")?.precio;
            const mediaCana = productos.find((p) => p.nombre === "medias media caña")?.precio;
            return `Soquete ${formatearPrecio(soquete)} · Media caña ${formatearPrecio(mediaCana)}`;
        }
        if (tit.includes("soquete")) {
            return productos.find((p) => p.nombre === "soquete")?.precio;
        }
        return productos.find((p) => p.nombre === "medias media caña")?.precio;
    }

    return null;
}

function initPrecios() {
    document.querySelectorAll(".product-card").forEach((card) => {
        const descripcion = card.querySelector(".producto-descripcion");
        if (!descripcion || descripcion.querySelector(".producto-precio")) {
            return;
        }

        const categoria = descripcion.querySelector("span")?.textContent.trim() || "";
        const titulo = descripcion.querySelector("h3")?.textContent.trim() || "";
        const precio = obtenerPrecio(categoria, titulo);

        if (precio === null || precio === undefined) {
            return;
        }

        const precioEl = document.createElement("p");
        precioEl.className = "producto-precio";
        precioEl.textContent = typeof precio === "string" ? precio : formatearPrecio(precio);
        descripcion.appendChild(precioEl);
    });
}

function abrirWhatsAppCompra(nombreProducto, precioTexto) {
    const mensaje = precioTexto
        ? `Hola KillerWhile, quiero comprar: ${nombreProducto} (${precioTexto})`
        : `Hola KillerWhile, quiero comprar: ${nombreProducto}`;

    window.open(
        `https://wa.me/${WHATSAPP_TELEFONO}?text=${encodeURIComponent(mensaje)}`,
        "_blank"
    );
}

function crearLightbox() {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = `
        <button type="button" class="lightbox-cerrar" aria-label="Cerrar">&times;</button>
        <div class="lightbox-contenido">
            <img class="lightbox-img" src="" alt="Vista ampliada del producto">
            <button type="button" class="lightbox-comprar">COMPRAR</button>
        </div>
    `;
    document.body.appendChild(lightbox);
    return lightbox;
}

function initLightbox() {
    const lightbox = document.querySelector(".lightbox") || crearLightbox();
    const lightboxImg = lightbox.querySelector(".lightbox-img");
    const btnCerrar = lightbox.querySelector(".lightbox-cerrar");
    const btnComprar = lightbox.querySelector(".lightbox-comprar");
    let productoActual = null;

    function abrir(src, alt, card) {
        const descripcion = card?.querySelector(".producto-descripcion");
        const nombre = descripcion?.querySelector("h3")?.textContent.trim() || alt;
        const precio = descripcion?.querySelector(".producto-precio")?.textContent.trim() || "";

        productoActual = { nombre, precio };
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightbox.hidden = false;
        document.body.classList.add("lightbox-abierto");
    }

    function cerrar() {
        lightbox.hidden = true;
        lightboxImg.src = "";
        productoActual = null;
        document.body.classList.remove("lightbox-abierto");
    }

    document.querySelectorAll(".product-card img").forEach((img) => {
        img.classList.add("producto-img-clic");
        img.addEventListener("click", () => {
            abrir(img.src, img.alt, img.closest(".product-card"));
        });
    });

    btnComprar.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!productoActual) {
            return;
        }
        abrirWhatsAppCompra(productoActual.nombre, productoActual.precio);
    });

    btnCerrar.addEventListener("click", cerrar);
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            cerrar();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !lightbox.hidden) {
            cerrar();
        }
    });
}

function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nombre = form.nombre.value.trim();
        const email = form.email.value.trim();
        const mensaje = form.mensaje.value.trim();

        if (!nombre || !email || !mensaje) {
            alert("Completá todos los campos del formulario.");
            return;
        }

        alert(`¡Gracias ${nombre}! Recibimos tu consulta y te responderemos a ${email}.`);
        form.reset();
    });
}

function initComprarLinks() {
    document.querySelectorAll(".product-card .carrito").forEach((enlace) => {
        const nombreProducto = enlace
            .closest(".product-card")
            ?.querySelector(".producto-descripcion h3")
            ?.textContent
            .trim();

        if (!nombreProducto) {
            return;
        }

        if (enlace.textContent.includes("Ver Productos")) {
            return;
        }

        enlace.addEventListener("click", (event) => {
            event.preventDefault();

            const precioTexto = enlace
                .closest(".product-card")
                ?.querySelector(".producto-precio")
                ?.textContent
                .trim();

            abrirWhatsAppCompra(nombreProducto, precioTexto);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initPrecios();
    initLightbox();
    initContactForm();
    initComprarLinks();
});
