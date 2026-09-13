const map = L.map("map").setView(coordinates, 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19
}).addTo(map);

L.marker(coordinates)
    .addTo(map)
    .bindPopup("<b>Listing Location</b>")
    .openPopup();