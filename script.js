document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.querySelector(".map-container");
    const svg = document.getElementById("interactiveMap");
    const entityCard = document.getElementById("entityCard");
    const startMessage = document.getElementById("startMessage");
    const noOrgMessage = document.getElementById("noOrgMessage");
    const cardContent = document.getElementById("cardContent");
    const registerButton = document.getElementById("registerButton");
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
            resetEntityCard(); // Show the "Start" message
        })
        .catch(error => console.error("Error loading providers:", error));

    // Reset the entity card to the "Start" state
    function resetEntityCard() {
        startMessage.style.display = "flex";
        noOrgMessage.style.display = "none";
        cardContent.style.display = "none";
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
            providerWebsite.innerHTML = `<a href="${provider.website}" target="_blank">${provider.website || "No website available"}</a>`;
            providerService.textContent = provider.service || "No service information available";
            providerRequirements.textContent = provider.requirements || "No requirements available";

            startMessage.style.display = "none";
            noOrgMessage.style.display = "none";
            cardContent.style.display = "block";
            prevProvider.style.display = filteredProviders.length > 1 ? "inline-block" : "none";
            nextProvider.style.display = filteredProviders.length > 1 ? "inline-block" : "none";
        } else {
            startMessage.style.display = "none";
            cardContent.style.display = "none";
            noOrgMessage.style.display = "flex"; // Show the "No Organization" message
            prevProvider.style.display = "none";
            nextProvider.style.display = "none";
        }
    }

    // Filter providers based on the selected country
    function filterProvidersByCountry(countryName) {
        filteredProviders = providers.filter(provider =>
            provider.country.split(", ").some(country => country.trim() === countryName)
        );
        currentIndex = 0;
        displayProvider(currentIndex);
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

    // Handle the registration button click
    registerButton.addEventListener("click", () => {
        alert("Redirecting to registration page..."); // Replace with actual redirection logic
    });

    // Scrolling Behavior for Entity Card
    entityCard.addEventListener("mouseenter", () => {
        cardContent.style.overflowY = "auto"; // Enable scrolling within the card
        document.body.style.overflow = "hidden"; // Disable page scrolling
    });

    entityCard.addEventListener("mouseleave", () => {
        cardContent.style.overflowY = "hidden"; // Disable scrolling within the card
        document.body.style.overflow = "auto"; // Enable page scrolling
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









function highlightCountriesWithProviders() {
    const countriesWithProviders = new Set(
        providers.map(provider => provider.country.trim())
    );

    svg.querySelectorAll("[name]").forEach(country => {
        const countryName = country.getAttribute("name").trim();
        if (countriesWithProviders.has(countryName)) {
            country.classList.add("has-provider");
        }
    });
}
