document.addEventListener("DOMContentLoaded", function () {
    const map = document.getElementById("interactiveMap");
    const entityCard = document.getElementById("entityCard");
    const closeButton = document.getElementById("closeButton");
    const prevProvider = document.getElementById("prevProvider");
    const nextProvider = document.getElementById("nextProvider");
    const cardContent = document.getElementById("cardContent");

    let providers = []; // Lista de proveedores
    let filteredProviders = []; // Proveedores filtrados por país
    let currentIndex = 0;

    // Cargar datos de los proveedores desde el archivo JSON
    fetch("providers.json")
        .then((response) => response.json())
        .then((data) => {
            providers = data;
            highlightCountriesWithProviders(data); // Resaltar países con proveedores
        })
        .catch((error) => console.error("Error loading providers:", error));

    // Resaltar países que tienen proveedores
    function highlightCountriesWithProviders(providers) {
        const countriesWithProviders = new Set(
            providers.flatMap(provider =>
                provider.country.split(/,\s*/).map(country => country.trim())
            )
        );

        const paths = map.querySelectorAll("path");
        paths.forEach((path) => {
            const countryName = path.getAttribute("name").trim();
            if (countriesWithProviders.has(countryName)) {
                path.classList.add("has-provider");
            } else {
                path.classList.remove("has-provider");
            }
        });
    }

    // Filtrar proveedores por país
    function filterProvidersByCountry(countryName) {
        filteredProviders = providers.filter(provider =>
            provider.country.split(/,\s*/).some(country => country.trim() === countryName)
        );
        currentIndex = 0; // Reiniciar el índice al primer proveedor
        displayProvider(currentIndex);
    }

    // Mostrar datos de un proveedor específico
    function displayProvider(index) {
        if (filteredProviders.length > 0) {
            const provider = filteredProviders[index];
            document.getElementById("providerName").textContent = provider.name || "Unknown";
            document.getElementById("providerAddress").textContent = provider.address || "Address not available";
            document.getElementById("providerPhone").textContent = provider.phone || "Phone not available";
            document.getElementById("providerWebsite").innerHTML = provider.website
                ? `<a href="${provider.website}" target="_blank">${provider.website}</a>`
                : "Website not available";
            document.getElementById("providerService").textContent = provider.service || "Service not available";
            showCard();
        } else {
            hideCard();
        }
    }

    // Mostrar la tarjeta de proveedor
    function showCard() {
        entityCard.classList.add("show");
    }

    // Ocultar la tarjeta de proveedor
    function hideCard() {
        entityCard.classList.remove("show");
    }

    // Manejar el clic en los países del mapa
    map.addEventListener("click", (event) => {
        const target = event.target;
        if (target.tagName === "path") {
            const countryName = target.getAttribute("name");
            filterProvidersByCountry(countryName);
        }
    });

    // Navegación entre proveedores
    prevProvider.addEventListener("click", () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : filteredProviders.length - 1;
        displayProvider(currentIndex);
    });

    nextProvider.addEventListener("click", () => {
        currentIndex = (currentIndex < filteredProviders.length - 1) ? currentIndex + 1 : 0;
        displayProvider(currentIndex);
    });

    // Cerrar la tarjeta al hacer clic en el botón "X"
    closeButton.addEventListener("click", hideCard);

    // Zoom y pan del mapa
    let zoomLevel = 1;
    let translateX = 0;
    let translateY = 0;

    map.addEventListener("wheel", (event) => {
        event.preventDefault();
        const delta = event.deltaY < 0 ? 0.1 : -0.1;
        adjustZoom(delta);
    });

    map.addEventListener("mousedown", (event) => {
        map.style.cursor = "grabbing";
        const startX = event.clientX - translateX;
        const startY = event.clientY - translateY;

        function onMouseMove(moveEvent) {
            translateX = moveEvent.clientX - startX;
            translateY = moveEvent.clientY - startY;
            updateTransform();
        }

        function onMouseUp() {
            map.style.cursor = "grab";
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        }

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    function adjustZoom(delta) {
        zoomLevel = Math.min(Math.max(zoomLevel + delta, 0.5), 3);
        updateTransform();
    }

    function updateTransform() {
        map.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    }
});
