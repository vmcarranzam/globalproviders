document.addEventListener("DOMContentLoaded", function () {
    const mapContainer = document.querySelector(".map-container");
    const svg = document.getElementById("interactiveMap");
    const entityCard = document.getElementById("entityCard");
    const closeButton = document.getElementById("closeButton");
    const startMessage = document.getElementById("startMessage");
    const noOrgMessage = document.getElementById("noOrgMessage");
    const cardContent = document.getElementById("cardContent");
    const registerButton = document.getElementById("registerButton");
    const providerName = document.getElementById("providerName");
    const providerAddress = document.getElementById("providerAddress");
    const providerPhone = document.getElementById("providerPhone");
    const providerWebsite = document.getElementById("providerWebsite");
    const providerService = document.getElementById("providerService");

    const providerCuntry = document.getElementById("providerCountry");  
    
    const facebookLink = document.getElementById("facebookLink");
    const instagramLink = document.getElementById("instagramLink");

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
            highlightCountriesWithProviders(data); // Highlight countries with providers
        })
        .catch(error => console.error("Error loading providers:", error));

    // Reset the entity card to the "Start" state
    //change
    function resetEntityCard() {
        entityCard.style.display = "none";
        startMessage.style.display = "none";
        noOrgMessage.style.display = "none";
        cardContent.style.display = "none";
        prevProvider.style.display = "none";
        nextProvider.style.display = "none";
            // Mobile behavior remains unchanged

        }
    
        resetEntityCard();


    // Display provider data for a specific index
    function displayProvider(index) {
        if (filteredProviders.length > 0) {
            const provider = filteredProviders[index];
            providerName.textContent = provider.name || "Unknown Provider";
            providerAddress.textContent = provider.address || "No address available";
            providerPhone.textContent = provider.phone || "No phone number available";
            
            providerCountry.textContent = provider.countryserv || "No country name available";
            
            providerWebsite.innerHTML = provider.website
                ? `<a href="${provider.website}" target="_blank">${provider.website}</a>`
                : "No website available";
            providerService.textContent = provider.service || "No service information available";
            providerRequirements.textContent = provider.requirements || "No requirements available";


            facebookLink.href = provider.facebook || "#";
            facebookLink.style.display = provider.facebook ? "inline-block" : "none";

            instagramLink.href = provider.instagram || "#";
            instagramLink.style.display = provider.instagram ? "inline-block" : "none";
    

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
            provider.country.split(/,\s*/).some(country => country.trim() === countryName)
        );
        currentIndex = 0;
        displayProvider(currentIndex);
    }

    // Highlight countries with providers
    function highlightCountriesWithProviders(providers) {
        const countriesWithProviders = new Set(
            providers.flatMap(provider =>
                provider.country.split(/,\s*/).map(country => country.trim())
            )
        );
    
        const svg = document.getElementById("interactiveMap");
        svg.querySelectorAll("[name]").forEach(country => {
            const countryName = country.getAttribute("name").trim();
            if (countriesWithProviders.has(countryName)) {
                country.classList.add("has-provider");
            } else {
                country.classList.remove("has-provider");
            }
        });
    }

    // Show or hide the entity card based on the screen size
    //change
    function toggleEntityCard(show) {
        if (show) {
            entityCard.style.display = "flex"; // Show the entity card
            closeButton.style.display = "block"; // Show the "Back to the map" button
        } else {
            entityCard.style.display = "none"; // Hide the entity card
            closeButton.style.display = "none"; // Always hide the button when the card is hidden
        }
    }
    
    // Add click event listeners to all countries in the SVG map
    svg.querySelectorAll("[name]").forEach(country => {
        country.addEventListener("click", (event) => {
            const countryName = event.target.getAttribute("name");
            filterProvidersByCountry(countryName);
            toggleEntityCard(true); // Show the card on country click (desktop and mobile)
        });
    });

    resetEntityCard();


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
        window.open("https://forms.gle/pxKFumntW2NuYkZy9", "_blank");
    });

    // Close button functionality
    closeButton.addEventListener("click", () => {
        toggleEntityCard(false); // Hide the card
    });

    // Handle window resize to update card visibility
    window.addEventListener("resize", () => {
        const isMobile = window.innerWidth <= 768;
        if (!isMobile) {
            toggleEntityCard(false);
        }
    });

    // Zoom functionality //
    const zoomInButton = document.getElementById("zoomIn");
    const zoomOutButton = document.getElementById("zoomOut");
    let isPanning = false;
    let startX, startY;
    let translateX = 0;
    let translateY = 0;
    let zoomLevel = 1;
    let initialDistance = null;

    // Zoom with wheel
    mapContainer.addEventListener("wheel", function (event) {
        event.preventDefault();
        adjustZoom(event.deltaY < 0 ? 0.1 : -0.1);
    });

    // Zoom with buttons
    zoomInButton.addEventListener("click", () => adjustZoom(0.1));
    zoomOutButton.addEventListener("click", () => adjustZoom(-0.1));

    //change
    function adjustZoom(delta) {
        const oldZoomLevel = zoomLevel;
        zoomLevel = Math.min(Math.max(zoomLevel + delta, 0.5), 3); // Clamp zoom level
        const zoomRatio = zoomLevel / oldZoomLevel;

        // Adjust position to keep the zoom centered
        translateX *= zoomRatio;
        translateY *= zoomRatio;
        updateTransform();
    }

    //change 
    function updateTransform() {
        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    }



    // Pan functionality
    svg.addEventListener("mousedown", function (event) {
        isPanning = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        svg.style.cursor = "grabbing";
    });

    //change 
    document.addEventListener("mousemove", (event) => {
        if (!isPanning) return;
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        updateTransform();
    });


    document.addEventListener("mouseup", function () {
        isPanning = false;
        svg.style.cursor = "grab";
    });

    function adjustPan() {
        const maxPanX = (svg.clientWidth * (zoomLevel - 1)) / 2;
        const maxPanY = (svg.clientHeight * (zoomLevel - 1)) / 2;

        translateX = Math.max(-maxPanX, Math.min(translateX, maxPanX));
        translateY = Math.max(-maxPanY, Math.min(translateY, maxPanY));

        svg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomLevel})`;
    }

    // change
    mapContainer.addEventListener("touchstart", (event) => {
        if (event.touches.length === 2) {
            initialDistance = getDistance(event.touches[0], event.touches[1]);
        } else if (event.touches.length === 1) {
            // Handle Dragging
            isPanning = true;
            startX = event.touches[0].clientX - translateX;
            startY = event.touches[0].clientY - translateY;
        }
    });

    //change
    mapContainer.addEventListener("touchmove", (event) => {
        if (event.touches.length === 2 && initialDistance) {
            event.preventDefault();
            const newDistance = getDistance(event.touches[0], event.touches[1]);
            const delta = (newDistance - initialDistance) * 0.002; // Adjust sensitivity
            adjustZoom(delta);
            initialDistance = newDistance;
        } else if (event.touches.length === 1 && isPanning) {
            translateX = event.touches[0].clientX - startX;
            translateY = event.touches[0].clientY - startY;
            updateTransform();
        }
    });

    //change
    mapContainer.addEventListener("touchend", () => {
        initialDistance = null;
        isPanning = false;
    });

    function getDistance(touch1, touch2) {
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    }

    //change
    let lastTap = 0;
    mapContainer.addEventListener("touchend", (event) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 300 && tapLength > 0) {
            adjustZoom(0.2);
        }

        lastTap = currentTime;
    });

});
