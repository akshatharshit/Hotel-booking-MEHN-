
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  // center: [77.2090, 28.6139], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  center: listing.geometry.coordinates,
  zoom: 9 // starting zoom
});

const marker = new mapboxgl.Marker({color : "black"})
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({offset : 16}).setHTML(`<h4>${listing.title}</h4><P>booking location</P>`))
        .addTo(map);
