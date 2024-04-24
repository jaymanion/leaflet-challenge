// Define the URL for fetching earthquake data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Fetch the earthquake data from the USGS GeoJSON API using D3
d3.json(url).then(data => {
    // Create a Leaflet map centered on a specific location
    const map = L.map('map').setView([0, 0], 2);

    // Add a base tile layer to the map
    const grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        id: 'osm_grayscale'
    }).addTo(map);

    const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        id: 'google_satellite'
    });

    const outdoors = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        id: 'osm_outdoors'
    });

    // Define base maps
    const baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Add layer control to switch between base maps
    L.control.layers(baseMaps).addTo(map);

    // Function to determine the size of the earthquake marker based on magnitude
    function markerSize(magnitude) {
        // You can adjust the multiplier to fit your visualization
        return magnitude * 5;
    }

    // Function to determine the color of the earthquake marker based on depth
    function markerColor(depth) {
        // Define color ranges based on depth intervals
        if (depth < 10) {
            return 'limegreen'; // Bright green for depths between -10 and 10
        } else if (depth >= 10 && depth < 30) {
            return 'yellowgreen'; // Yellow-green for depths between 10 and 30
        } else if (depth >= 30 && depth < 50) {
            return 'orange'; // Orange for depths between 30 and 50
        } else if (depth >= 50 && depth < 70) {
            return 'darkorange'; // Dark orange for depths between 50 and 70
        } else if (depth >= 70 && depth < 90) {
            return 'orangered'; // Orange-redish for depths between 70 and 90
        } else if (depth >= 90) {
            return 'red'; // Default to red for depths outside specified ranges	
        } else {
            return 'green'; // Default to green for depths outside specified ranges
        }
    }

    // Loop through each feature in the GeoJSON data
    data.features.forEach(feature => {
        // Extract necessary information from each feature
        const { geometry, properties } = feature;
        const { mag, place, time } = properties;
        const [lng, lat, depth] = geometry.coordinates;

        // Create a marker for each earthquake
        L.circleMarker([lat, lng], {
            radius: markerSize(mag),
            fillColor: markerColor(depth),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<strong>Location:</strong> ${place}<br><strong>Magnitude:</strong> ${mag}<br><strong>Depth:</strong> ${depth} km`).addTo(map);
    });

    // Create a legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [0, 10, 30, 50, 70, 90];
        const colors = ['limegreen', 'yellowgreen', 'orange', 'darkorange', 'orangered', 'red'];

        for (let i = 0; i < depths.length; i++) {
            div.innerHTML += `<div><i style="background:${colors[i]}"></i>${depths[i]}${depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+'}</div>`;
        }

        return div;
    };
    legend.addTo(map);
});
