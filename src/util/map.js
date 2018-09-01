import L from 'leaflet';

let map;
let meMarker;
const icons = {
  BOAT: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ship.svg',
  BUS: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_bus.svg',
  TAXI: 'https://image.flaticon.com/icons/png/128/75/75780.png',
  TRAM: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_tram.svg',
  LDT: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ic.svg', // long distance train
  REG: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ic.svg', // regionaltåg
  VAS: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ice.svg' // västtågen
};

const getIcon = (prodtype) => {
  return L.icon({
    iconUrl: icons[prodtype],
    iconSize:     [20, 20], // size of the icon
    iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -16] // point from which the popup should open relative to the iconAnchor
  });
};

const fromWGS84 = (lat, long) => ({
  lat: lat / 1000000,
  lng: long / 1000000
});

function initMap({ rootElement, position, zoom = 13 }) {
  const { lat, lng } = position;
  map = L.map(rootElement).setView([lat, lng], zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);

  meMarker = createMarker([lat, lng], {}, '<p>Din position</p>');

  return map;
}

function createMarker(latlng, options = {}, content) {
  const marker = L.marker(latlng, options).addTo(map);
  if (content) {
    marker.bindPopup(content);
  }
  return marker;
}

function centerOnMe({ lat, lng }) {
  meMarker.setLatLng([lat, lng]);
  // map.flyTo([lat, lng]);
}

function drawPolyLine(latlngs, color = 'red') {
  const polyline = L.polyline(latlngs, {color}).addTo(map);
  // zoom the map to the polyline
  map.fitBounds(polyline.getBounds());
  return polyline;
}

const createVehicleMarker = (vehicle) => {
  const { x, y, name, prodclass } = vehicle;
  const delay = parseInt(vehicle.delay, 10);
  const isDelayed = delay > 0;
  const delayedText = isDelayed ?
    `<p style="margin: .5em 0 0;">${delay} ${delay > 1 ? 'minuter' : 'minut'} försenad.</p>` :
    '';

  const content = `
    <div class="marker-info" style="background-color: ${vehicle.bcolor}; color: ${vehicle.lcolor}; padding: .5em;">
      <h3 style="margin: .2em 0;">${name}</h3>
      <small>(${vehicle.gid})</small>
      ${delayedText}
    </div>
  `;

  const { lat, lng } = fromWGS84(y, x);
  const marker = createMarker([lat, lng], {
    icon: getIcon(prodclass),
    title: vehicle.gid
  }, content);

  return marker;
};

function updateVehicleMarkerPosition(marker, { y, x }) {
  const {lat, lng} = fromWGS84(y, x);
  marker.setLatLng([lat, lng]);
}

export default {
  initMap,
  getIcon,
  createMarker,
  createVehicleMarker,
  updateVehicleMarkerPosition,
  centerOnMe,
  drawPolyLine
};
