export function initZones() {
    fetchZones();
}

let zones = {}; // Declare the zones variable

function fetchZones(){
    fetch(`/get-zones`)
        .then(response => response.json())
        .then(data => {
            zones = data;
            const countryKeys = Object.keys(zones);
            populateDropdown(countryKeys, selectCountry, "countryDropdownMenu");
        })
        .catch(error => console.error('Error fetching zone data:', error));
}

function selectCountry(country){
    if (zones.hasOwnProperty(country)) {
        const zonesList = zones[country].zones;
        populateDropdown(zonesList, selectZone, "zoneDropdownMenu");

        const priceZones = zones[country].electrictyZones;
        populateDropdown(priceZones, selectPriceZone, "priceDropdownMenu");
    }
    const countryButton = document.getElementById("dropdownMenuButton");
    countryButton.textContent = country;
}

function populateDropdown(list, onClick, id) {
    const dropdownMenu = document.getElementById(id);
    dropdownMenu.innerHTML = ""; // Clear existing items
    list.forEach(item => {
        const dropdownItem = document.createElement("li");
        const anchor = document.createElement("a");
        anchor.className = "dropdown-item";
        anchor.href = "#";
        anchor.textContent = item;
        anchor.onclick = () => onClick(item);
        dropdownItem.appendChild(anchor);
        dropdownMenu.appendChild(dropdownItem);
    });
}

function selectPriceZone(zone) {
    console.log("Selected Price Zone:", zone);
    const button = document.getElementById("electrictyBtn");
    button.textContent = zone;

    fetch("/set_price_zone", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ zone: zone })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);
    })
    .catch(error => console.error("Error:", error));
}

function selectZone(zone) {
    const button = document.getElementById("zoneBtn");
    button.textContent = zone;
    //document.getElementById("selectedZone").innerText = "Selected Zone: " + zone;
    fetch("/set_carbon_zone", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ zone: zone })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server Response:", data);
    })
    .catch(error => console.error("Error:", error));
}