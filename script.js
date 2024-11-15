document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.querySelector(".map-container");
    const svg = document.getElementById("interactiveMap");
    const entityCard = document.getElementById("entityCard");
    const closeButton = document.getElementById("closeButton");
    const providerName = document.getElementById("providerName");
    const providerAddress = document.getElementById("providerAddress");
    const providerPhone = document.getElementById("providerPhone");
    const providerWebsite = document.getElementById("providerWebsite");
    const providerService = document.getElementById("providerService");
    const providerRequirements = document.getElementById("providerRequirements");
    const prevProvider = document.createElement("button");
    const nextProvider = document.createElement("button");

    let providers = [];
    let filteredProviders = [];
    let currentIndex = 0;

    // Add navigation buttons
    prevProvider.textContent = "Prev";
    nextProvider.textContent = "Next";
    prevProvider.classList.add("nav-button");
    nextProvider.classList.add("nav-button");
    entityCard.appendChild(prevProvider);
    entityCard.appendChild(nextProvider);

    // Load providers data
    fetch("providers.json")
        .then(response => response.json())
        .then(data => {
            providers = data;
            filteredProviders = providers; // Initially display all
            resetEntityCard(); // Show the default message
        })
        .catch(error => console.error("Error loading providers:", error));

    // Reset the entity card to the default state
    function resetEntityCard() {
        entityCard.style.display = "block";
        providerName.textContent = "Click or tap on a country to see its registered providers";
        providerAddress.textContent = "";
        providerPhone.textContent = "";
        providerWebsite.textContent = "";
        providerService.textContent = "";
        providerRequirements.textContent = "";
        prevProvider.style.display = "none";
        nextProvider.style.display = "none";
    }

    // Display provider data for a specific index
    function displayProvider(index) {
        if (filteredProviders.length > 0) {
            const provider = filteredProviders[index];
            providerName.textContent = provider.name || "Unknown Provider";
            providerAddress.textContent = provider.address || "No address available";
            providerPhone.textContent = provider.phone || "No phone number available";
            providerWebsite.textContent = provider.website || "No website available";
            providerWebsite.href = provider.website.startsWith("http")
                ? provider.website
                : `https://${provider.website}`;
            providerService.textContent = provider.service || "No service information available";
            providerRequirements.textContent = provider.requirements || "No requirements available";

            // Show navigation buttons if multiple providers are available
            prevProvider.style.display = filteredProviders.length > 1 ? "inline-block" : "none";
            nextProvider.style.display = filteredProviders.length > 1 ? "inline-block" : "none";
        } else {
            resetEntityCard();
        }
    }

    // Filter providers based on the selected country
    function filterProvidersByCountry(countryName) {
        filteredProviders = providers.filter(provider =>
            provider.country.split(", ").some(country => country.trim() === countryName)
        );
        currentIndex = 0;
        displayProvider(currentIndex);

        // Show the card on mobile
        if (window.innerWidth <= 768) {
            entityCard.classList.add("show");
        }
    }

    // Add click event listeners to all countries in the SVG map
    svg.querySelectorAll("[name]").forEach(country => {
        country.addEventListener("click", (event) => {
            const countryName = event.target.getAttribute("name");
            filterProvidersByCountry(countryName);
        });
    });

    // Navigation button functionality
    prevProvider.addEventListener("click", () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : filteredProviders.length - 1;
        displayProvider(currentIndex);
    });

    nextProvider.addEventListener("click", () => {
        currentIndex = (currentIndex < filteredProviders.length - 1) ? currentIndex + 1 : 0;
        displayProvider(currentIndex);
    });

    // Close the entity card on mobile
    closeButton.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
            entityCard.classList.remove("show");
        }
    });

    // Handle window resize events to adjust card visibility
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            entityCard.style.display = "block"; // Always visible on larger screens
            closeButton.style.display = "none"; // Hide close button
        } else {
            entityCard.style.display = "none"; // Hidden by default on mobile
            closeButton.style.display = "block"; // Show close button on mobile
        }
    });

    // Enable panning and zooming for the map
    let isPanning = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;
    let zoomLevel = 1;

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

    mapContainer.addEventListener("wheel", function (event) {
        event.preventDefault();
        adjustZoom(event.deltaY < 0 ? 0.1 : -0.1);
    });

    function adjustZoom(delta) {
        zoomLevel = Math.min(Math.max(zoomLevel + delta, 0.5), 3);
        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    }

    // Ensure the card visibility is set correctly on page load
    window.dispatchEvent(new Event("resize"));
});
