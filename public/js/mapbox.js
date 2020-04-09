/* eslint-disable */
console.log('hello from the mapboxs');

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiaW1ub21lZSIsImEiOiJjazhxbWZxYzEwMTY4M3NxYXRqMTBtbWZwIn0.b6escU__K9468ByVZqI3hg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/imnomee/ck8qmq9860dt41inrmuuiftvk',
  //   center: [-1.857191, 52.441489],
  //     zoom: 10,
  //     maxZoom: 20,
  scrollZoom: false,
  dragRotate: false,
  //     keyboard: false,
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach((loc) => {
  //create marker
  const el = document.createElement('div');
  el.className = 'marker';

  //add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);
  // extend the bounds to incllude current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 100,
    left: 100,
    right: 100,
  },
});
