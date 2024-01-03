// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Check if the data.features array exists
  if (data.features) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  } else {
    console.error("GeoJSON data does not contain features array:", data);
  }
}).catch(function (error) {
  console.error("Error fetching GeoJSON data:", error);
});

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place, time, magnitude, and depth of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</p><p>${new Date(feature.properties.time)}</p>`);
  }

  // Define a function to determine marker size based on earthquake magnitude.
  function markerSize(magnitude) {
    return magnitude * 5; // Adjust the multiplier based on your preference for marker size scaling.
  }

  // Define a function to determine marker color based on earthquake depth.
  function markerColor(depth) {
    // Use a gradient or color scale based on depth values.
    // You can customize this part based on your preferred color representation.
    return depth > 90 ? '#FF4500' : depth > 70 ? '#FFA500' : depth > 50 ? '#FFFF00' : depth > 30 ? '#7FFF00' : '#00FF00';
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return new L.circleMarker(latlng, {
        radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    },
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a legend.
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function (myMap) {
    let div = L.DomUtil.create("div", "info legend"),
      depths = [0, 30, 50, 70, 90],
      labels = [];

    div.innerHTML += "<h4>Earthquake Depth</h4>";

    for (let i = 0; i < depths.length; i++) {
      let from = depths[i],
        to = depths[i + 1] - 1;

      div.innerHTML +=
        '<i style="background:' + markerColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);

  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
