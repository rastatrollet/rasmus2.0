const keyRes = process.env.RESROBOT_RESEPLANERARE_KEY;
const keyTab = process.env.RESROBOT_STOLPTIDTABELLER_KEY;
const baseUrl = 'https://api.resrobot.se/v2';
const fetchOptions = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
};

function transformStop(stop) {
  return {
    ...stop,
    name: stop.name.replace(/\([^)]*\)$/, ''),
    region: 'RR',
  };
}

function byMostTrafficatedStop(a, b) {
  const aName = a.name.split(' ')[0];
  const bName = b.name.split(' ')[0];
  if (aName !== bName) return 0;
  return a.weight < b.weight ? 1 : -1;
}

async function getClosestStops({ lat, lng }, limit = 5) {
  const url = `location.nearbystops?&originCoordLat=${lat}&originCoordLong=${lng}&maxNo=${limit}`;
  return makeRequest(url).then((json) => {
    return json.StopLocation.map(transformStop).sort(byMostTrafficatedStop);
  });
}

function getClosestStop(pos) {
  return getClosestStops(pos, 1)[0];
}

async function findStops(term) {
  const url = `location.name?input=${encodeURIComponent(term)}&maxNo=5`;
  return makeRequest(url).then((json) => json.StopLocation.map(transformStop));
}

async function getDeparturesFrom(id) {
  const url = `departureBoard?id=${id}`;
  return makeRequest(url, keyTab).then((json) => {
    return json.Departure.map((trip) => ({
      ...trip,
      fgColor: '#0080ac',
      bgColor: 'white',
      timestamp: new Date(trip.ExpectedDateTime || trip.TimeTabledDateTime).getTime(),
      time: trip.time.substr(0, 5),
      rtTime: trip.rtTime && trip.rtTime.substr(0, 5),
      direction: trip.direction
        .replace(/\([^)]*\)$/, '')
        .replace('T-bana', '')
        .trim(),
      name: trip.name.replace('Länstrafik - ', ''),
      sname: trip.transportNumber,
      track: trip.rtDepTrack || trip.rtTrack,
      region: 'RR',
      href: '#',
      isLate: Boolean(trip.rtTime && trip.time !== trip.rtTime),
    }));
  });
}

function getTrafficSituations() {
  return Promise.resolve({ messages: [] });
}

function fetchMiddleware(response) {
  if (response.ok && response.status !== 204) {
    return response.json();
  }

  if (!response.ok) {
    return response.json().then((err) => Promise.reject(err));
  }

  console.log('fetchMiddleware: not json and no error');
  return response;
}

function makeRequest(path, key = keyRes) {
  const url = `${baseUrl}/${path}&key=${key}&format=json`;
  return fetch(url, fetchOptions)
    .then(fetchMiddleware)
    .catch((err) => console.error(err));
}

export default {
  getClosestStop,
  getClosestStops,
  getDeparturesFrom,
  getTrafficSituations,
  findStops,
  init() {
    return Promise.resolve();
  },
};
