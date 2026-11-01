mapboxgl.accessToken = mapToken;

// Ensure coordinates exist; fallback to Delhi if missing on legacy listings
const coordinates =
  listing.geometry && listing.geometry.coordinates.length
    ? listing.geometry.coordinates
    : [77.209, 28.6139];

const map = new mapboxgl.Map({
  container: "map", // ID of the HTML element
  style: "mapbox://styles/mapbox/streets-v12", // Map style
  center: coordinates, // [longitude, latitude]
  zoom: 11,
});

// Add zoom and rotation controls
map.addControl(new mapboxgl.NavigationControl());

// Add custom Marker with a Popup
const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
  `<h6 class="fw-bold">${listing.title}</h6><p class="text-muted m-0">Exact location provided after booking.</p>`,
);

new mapboxgl.Marker({ color: "#fe424d" }) // Airbnb red
  .setLngLat(coordinates)
  .setPopup(popup)
  .addTo(map);
