const CATEGORIA_LABELS = {
    remeras: "Remeras",
    buzos: "Buzos",
    camperas: "Camperas",
    medias: "Medias",
    pantalones: "Pantalones",
};

const PRECIO_POR_CATEGORIA = {
    remeras: 15000,
    buzos: 25000,
    camperas: 50000,
    medias: 2500,
    pantalones: 35000,
};

const CARRITO_STORAGE_KEY = "killerwhile-carrito";
const WHATSAPP_TELEFONO = "5491123909541";

let carrito = [];

function esPaginaHome() {
    return document.body.dataset.pagina === "home";
}

function obtenerBaseRuta() {
    return window.location.pathname.includes("/pages/") ? "../" : "";
}

function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(precio);
}

function obtenerPrecioCategoria(categoria) {
    return PRECIO_POR_CATEGORIA[categoria] ?? null;
}

function obtenerPrecio(categoria, titulo) {
    const cat = categoria.toLowerCase();
    const tit = titulo.toLowerCase();

    if (cat.includes("remera")) {
        return PRECIO_POR_CATEGORIA.remeras;
    }
    if (cat.includes("buzo")) {
        return PRECIO_POR_CATEGORIA.buzos;
    }
    if (cat.includes("pantalon")) {
        return PRECIO_POR_CATEGORIA.pantalones;
    }
    if (cat.includes("campera")) {
        return PRECIO_POR_CATEGORIA.camperas;
    }
    if (cat.includes("media")) {
        if (tit.includes("soquete") && tit.includes("media")) {
            const soquete = 2000;
            const mediaCana = PRECIO_POR_CATEGORIA.medias;
            return `Soquete ${formatearPrecio(soquete)} · Media caña ${formatearPrecio(mediaCana)}`;
        }
        return PRECIO_POR_CATEGORIA.medias;
    }

    return null;
}

function crearIdProducto(categoria, archivo) {
    return `${categoria}-${archivo}`;
}

function obtenerDatosTarjeta(card) {
    const categoria = card.dataset.categoria || "";
    const archivo = card.dataset.archivo || "";
    const descripcion = card.querySelector(".producto-descripcion");
    const titulo = descripcion?.querySelector("h3")?.textContent.trim() || "";
    const precioTexto = descripcion?.querySelector(".producto-precio")?.textContent.trim() || "";
    const precioNumero = card.dataset.precio ? Number(card.dataset.precio) : null;
    const imagen = card.querySelector("img")?.getAttribute("src") || "";
    const enlaceCategoria = card.querySelector(".carrito")?.getAttribute("href") || "";

    return {
        id: categoria && archivo ? crearIdProducto(categoria, archivo) : titulo,
        categoria,
        archivo,
        titulo,
        precioTexto,
        precioNumero,
        imagen,
        enlaceCategoria,
    };
}

function crearTarjetaProducto(categoria, item) {
    const precio = obtenerPrecioCategoria(categoria);
    const card = document.createElement("div");
    card.className = "product-card";
    card.dataset.categoria = categoria;
    card.dataset.archivo = item.archivo;
    card.dataset.precio = precio;

    card.innerHTML = `
        <img src="${obtenerBaseRuta()}img/${categoria}/${item.archivo}" alt="${item.titulo}">
        <div class="producto-descripcion">
            <span>${CATEGORIA_LABELS[categoria]}</span>
            <h3>${item.titulo}</h3>
            <p class="producto-precio">${formatearPrecio(precio)}</p>
        </div>
        <div class="producto-acciones">
            <button type="button" class="btn-comprar">COMPRAR</button>
            <button type="button" class="btn-agregar-carrito">AGREGAR AL CARRITO</button>
        </div>
    `;

    return card;
}

function renderCatalogo() {
    const contenedorTienda = document.getElementById("productos-tienda");
    const contenedorCategoria = document.getElementById("productos-categoria");

    if (contenedorTienda && typeof catalogoProductos !== "undefined") {
        Object.entries(catalogoProductos).forEach(([categoria, items]) => {
            items.forEach((item) => {
                contenedorTienda.appendChild(crearTarjetaProducto(categoria, item));
            });
        });
    }

    if (contenedorCategoria && typeof catalogoProductos !== "undefined") {
        const categoria = contenedorCategoria.dataset.categoria;
        const items = catalogoProductos[categoria] || [];

        items.forEach((item) => {
            contenedorCategoria.appendChild(crearTarjetaProducto(categoria, item));
        });
    }
}

function initPreciosHome() {
    document.querySelectorAll(".product-card:not([data-archivo])").forEach((card) => {
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

function cargarCarrito() {
    try {
        const guardado = localStorage.getItem(CARRITO_STORAGE_KEY);
        carrito = guardado ? JSON.parse(guardado) : [];
    } catch {
        carrito = [];
    }
}

function guardarCarrito() {
    localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
    const contador = document.getElementById("carritoContador");
    if (!contador) {
        return;
    }

    const totalItems = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    contador.textContent = String(totalItems);
}

function renderCarritoPanel() {
    const lista = document.getElementById("carritoLista");
    const totalEl = document.getElementById("carritoTotal");

    if (!lista || !totalEl) {
        return;
    }

    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = "<li class='carrito-vacio'>Tu carrito está vacío.</li>";
        totalEl.textContent = formatearPrecio(0);
        return;
    }

    let total = 0;

    carrito.forEach((item) => {
        total += item.precio * item.cantidad;

        const li = document.createElement("li");
        li.className = "carrito-item";
        li.innerHTML = `
            <div class="carrito-item-info">
                <strong>${item.titulo}</strong>
                <span>${formatearPrecio(item.precio)} x ${item.cantidad}</span>
            </div>
            <button type="button" class="carrito-item-quitar" data-id="${item.id}" aria-label="Quitar producto">×</button>
        `;
        lista.appendChild(li);
    });

    totalEl.textContent = formatearPrecio(total);
}

function agregarAlCarrito(datos) {
    const precio = datos.precioNumero ?? obtenerPrecioCategoria(datos.categoria);
    const itemExistente = carrito.find((item) => item.id === datos.id);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            id: datos.id,
            titulo: datos.titulo,
            categoria: datos.categoria,
            archivo: datos.archivo,
            precio,
            cantidad: 1,
        });
    }

    guardarCarrito();
    actualizarContadorCarrito();
    renderCarritoPanel();
}

function quitarDelCarrito(id) {
    carrito = carrito.filter((item) => item.id !== id);
    guardarCarrito();
    actualizarContadorCarrito();
    renderCarritoPanel();
}

function initCarrito() {
    cargarCarrito();
    actualizarContadorCarrito();
    renderCarritoPanel();

    const panel = document.getElementById("carritoPanel");
    const toggle = document.getElementById("carritoToggle");
    const cerrar = document.getElementById("carritoCerrar");
    const btnWhatsApp = document.getElementById("carritoWhatsApp");

    toggle?.addEventListener("click", () => {
        panel?.classList.toggle("abierto");
    });

    cerrar?.addEventListener("click", () => {
        panel?.classList.remove("abierto");
    });

    document.getElementById("carritoLista")?.addEventListener("click", (event) => {
        const boton = event.target.closest(".carrito-item-quitar");
        if (!boton) {
            return;
        }
        quitarDelCarrito(boton.dataset.id);
    });

    btnWhatsApp?.addEventListener("click", () => {
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        const detalle = carrito
            .map((item) => `${item.titulo} x${item.cantidad} (${formatearPrecio(item.precio * item.cantidad)})`)
            .join("\n");
        const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
        const mensaje = `Hola KillerWhile, quiero comprar:\n${detalle}\nTotal: ${formatearPrecio(total)}`;

        window.open(
            `https://wa.me/${WHATSAPP_TELEFONO}?text=${encodeURIComponent(mensaje)}`,
            "_blank"
        );
    });

    document.addEventListener("click", (event) => {
        if (!panel?.classList.contains("abierto")) {
            return;
        }

        if (
            event.target.closest("#carritoPanel") ||
            event.target.closest("#carritoToggle")
        ) {
            return;
        }

        panel.classList.remove("abierto");
    });
}

function initAccionesProducto() {
    document.addEventListener("click", (event) => {
        const btnComprar = event.target.closest(".btn-comprar");
        const btnAgregar = event.target.closest(".btn-agregar-carrito");

        if (btnComprar) {
            const card = btnComprar.closest(".product-card");
            const datos = obtenerDatosTarjeta(card);
            abrirWhatsAppCompra(datos.titulo, datos.precioTexto);
            return;
        }

        if (btnAgregar) {
            const card = btnAgregar.closest(".product-card");
            const datos = obtenerDatosTarjeta(card);
            agregarAlCarrito(datos);
            btnAgregar.textContent = "AGREGADO ✓";
            setTimeout(() => {
                btnAgregar.textContent = "AGREGAR AL CARRITO";
            }, 1200);
        }
    });
}

function crearLightbox() {
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.hidden = true;
    lightbox.innerHTML = `
        <button type="button" class="lightbox-cerrar" aria-label="Cerrar">&times;</button>
        <div class="lightbox-contenido">
            <img class="lightbox-img" src="" alt="Vista ampliada del producto">
            <div class="lightbox-acciones">
                <button type="button" class="lightbox-comprar">COMPRAR</button>
                <button type="button" class="lightbox-agregar-carrito">AGREGAR AL CARRITO</button>
                <button type="button" class="lightbox-ver-productos">VER PRODUCTOS</button>
            </div>
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
    const btnAgregar = lightbox.querySelector(".lightbox-agregar-carrito");
    const btnVerProductos = lightbox.querySelector(".lightbox-ver-productos");
    let productoActual = null;

    function configurarBotones() {
        const esHome = esPaginaHome();

        btnComprar.hidden = esHome;
        btnAgregar.hidden = esHome;
        btnVerProductos.hidden = !esHome;
    }

    function abrir(card) {
        const datos = obtenerDatosTarjeta(card);
        productoActual = datos;
        lightboxImg.src = card.querySelector("img")?.src || "";
        lightboxImg.alt = datos.titulo;
        configurarBotones();
        lightbox.hidden = false;
        document.body.classList.add("lightbox-abierto");
    }

    function cerrar() {
        lightbox.hidden = true;
        lightboxImg.src = "";
        productoActual = null;
        document.body.classList.remove("lightbox-abierto");
    }

    document.addEventListener("click", (event) => {
        const img = event.target.closest(".product-card img");
        if (!img) {
            return;
        }
        abrir(img.closest(".product-card"));
    });

    btnComprar.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!productoActual) {
            return;
        }
        abrirWhatsAppCompra(productoActual.titulo, productoActual.precioTexto);
    });

    btnAgregar.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!productoActual) {
            return;
        }
        agregarAlCarrito(productoActual);
        cerrar();
    });

    btnVerProductos.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!productoActual?.enlaceCategoria) {
            return;
        }
        window.location.href = productoActual.enlaceCategoria;
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

function initNavDropdown() {
    document.querySelectorAll(".nav-dropdown-toggle").forEach((toggle) => {
        toggle.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();

            const dropdown = toggle.closest(".nav-dropdown");
            const abierto = dropdown.classList.contains("open");

            document.querySelectorAll(".nav-dropdown.open").forEach((item) => {
                item.classList.remove("open");
            });

            if (!abierto) {
                dropdown.classList.add("open");
            }
        });
    });

    document.querySelectorAll(".nav-dropdown-menu").forEach((menu) => {
        menu.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    });

    document.addEventListener("click", () => {
        document.querySelectorAll(".nav-dropdown.open").forEach((item) => {
            item.classList.remove("open");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    renderCatalogo();
    initPreciosHome();
    initNavDropdown();
    initCarrito();
    initAccionesProducto();
    initLightbox();
    initContactForm();
});
