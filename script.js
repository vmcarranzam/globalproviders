document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.querySelector(".map-container");
    const svg = document.getElementById("interactiveMap");
    const zoomInButton = document.getElementById("zoomIn");
    const zoomOutButton = document.getElementById("zoomOut");
    const providerName = document.getElementById("providerName");
    const providerAddress = document.getElementById("providerAddress");
    const providerPhone = document.getElementById("providerPhone");
    const providerWebsite = document.getElementById("providerWebsite");
    const providerService = document.getElementById("providerService");
    const providerRequirements = document.getElementById("providerRequirements");
    const prevProvider = document.getElementById("prevProvider");
    const nextProvider = document.getElementById("nextProvider");

    let isPanning = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;
    let zoomLevel = 1;
    let initialDistance = null;
    let providers = [];
    let filteredProviders = [];
    let currentIndex = 0;

    // Load providers data
    fetch("providers.json")
        .then(response => response.json())
        .then(data => {
            providers = data;
            filteredProviders = providers; // Initially display all
            displayProvider(currentIndex);
        })
        .catch(error => console.error("Error loading providers:", error));

    function displayProvider(index) {
        if (filteredProviders.length > 0) {
            const provider = filteredProviders[index];
            providerName.textContent = provider.name;
            providerAddress.textContent = provider.address;
            providerPhone.textContent = provider.phone;
            providerWebsite.textContent = provider.website;
            providerWebsite.href = provider.website.startsWith("http") ? provider.website : `https://${provider.website}`;
            providerService.textContent = provider.service;
            providerRequirements.textContent = provider.requirements;

            adjustFontSize(providerName);
            adjustFontSize(providerAddress);
            adjustFontSize(providerPhone);
            adjustFontSize(providerService);
            adjustFontSize(providerRequirements);
        } else {
            providerName.textContent = "No providers found";
            providerAddress.textContent = "";
            providerPhone.textContent = "";
            providerWebsite.textContent = "";
            providerService.textContent = "";
            providerRequirements.textContent = "";
        }
    }

    function adjustFontSize(element) {
        let fontSize = parseInt(window.getComputedStyle(element).fontSize);
        while (element.scrollHeight > element.clientHeight && fontSize > 10) {
            fontSize -= 1;
            element.style.fontSize = fontSize + "px";
        }
    }

    prevProvider.addEventListener("click", () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : filteredProviders.length - 1;
        displayProvider(currentIndex);
    });

    nextProvider.addEventListener("click", () => {
        currentIndex = (currentIndex < filteredProviders.length - 1) ? currentIndex + 1 : 0;
        displayProvider(currentIndex);
    });

    function filterProvidersByCountry(countryName) {
        filteredProviders = providers.filter(provider =>
            provider.country.split(", ").some(country => country.trim() === countryName)
        );
        currentIndex = 0;
        displayProvider(currentIndex);
    }

    // Add click event listeners to countries using the 'name' attribute
    svg.querySelectorAll("[name]").forEach(country => {
        country.addEventListener("click", (event) => {
            const countryName = event.target.getAttribute("name");
            filterProvidersByCountry(countryName);
        });
    });

    mapContainer.addEventListener("wheel", function (event) {
        event.preventDefault();
        adjustZoom(event.deltaY < 0 ? 0.1 : -0.1);
    });

    function adjustZoom(delta) {
        zoomLevel = Math.min(Math.max(zoomLevel + delta, 0.5), 3);
        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    }

    svg.addEventListener("mousedown", function (event) {
        isPanning = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        svg.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", function (event) {
        if (!isPanning) return;
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    });

    document.addEventListener("mouseup", function () {
        isPanning = false;
        svg.style.cursor = "grab";
    });

    mapContainer.addEventListener("touchstart", function (event) {
        if (event.touches.length === 2) {
            initialDistance = getDistance(event.touches[0], event.touches[1]);
        }
    });

    mapContainer.addEventListener("touchmove", function (event) {
        if (event.touches.length === 2 && initialDistance) {
            event.preventDefault();
            const newDistance = getDistance(event.touches[0], event.touches[1]);
            const delta = (newDistance - initialDistance) * 0.005;
            adjustZoom(delta);
            initialDistance = newDistance;
        }
    });

    mapContainer.addEventListener("touchend", function () {
        initialDistance = null;
    });

    function getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }
});
