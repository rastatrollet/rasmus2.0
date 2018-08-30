const travelPlanner = 'https://api.vasttrafik.se/bin/rest.exe/v2';
const trafficSituations = 'https://api.vasttrafik.se/ts/v1/traffic-situations';
let authToken;
let expDate;

function getTrafficSituations(gid, method) {
  const url = method
    ? `${trafficSituations}/${method}/${gid}`
    : trafficSituations;
  return anropaVasttrafik(url, { Accept: 'application/json' })
    .then(sit => (console.log('sit', sit), sit))
    .then(situations =>
      situations.reduce(
        (res, { title, description, affectedLines }) => ({
          messages: res.messages.concat(`${title} ${description}`),
          affectedLines: [].concat(
            res.affectedLines,
            affectedLines.map(({ designation }) => designation)
          )
        }),
        { messages: [] }
      )
    );
}

function getTripSuggestion(from, dest) {
  const now = new Date();
  const date = now.toISOString().substr(0, 10);
  const time = now.toLocaleTimeString().substr(0, 5);
  const tripUrl = `${travelPlanner}/trip?originId=${from}&destId=${dest}&date=${date}&time=${time}&format=json`;
  return anropaVasttrafik(tripUrl).then(json =>
    asArray(json.TripList.Trip).map(trip => asArray(trip.Leg))
  );
}

function findStops(text) {
  const requestUrl = `${travelPlanner}/location.name?input=${encodeURIComponent(
    text
  )}&format=json`;
  return anropaVasttrafik(requestUrl)
    .then(json => asArray(json.LocationList.StopLocation).slice(0, 5))
    .then(stops =>
      stops.map(stop =>
        Object.assign({}, stop, {
          region: 'VT'
        })
      )
    );
}

function transformTrips(trips) {
  return trips.map(trip => {
    const isLate = trip.rtTime && trip.rtTime !== trip.time;
    const time = trip.rtTime || trip.time;
    const date = trip.rtDate || trip.date;
    const timestamp = new Date(`${date}T${time}`).getTime();
    // const journeyDetail = await anropaVasttrafik(trip.JourneyDetailRef.ref);
    return Object.assign({}, trip, {
      region: 'VT',
      cancelled: Boolean(trip.cancelled),
      isLate,
      timestamp
    });
  });
}

function getArrivalsTo(id, timeSpan) {
  const now = new Date();
  const date = now.toISOString().substr(0, 10);
  const time = now.toLocaleTimeString().substr(0, 5);
  let requestUrl = `${travelPlanner}/arrivalBoard?id=${encodeURIComponent(
    id
  )}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(
    time
  )}&format=json`;
  if (timeSpan) {
    requestUrl = `${requestUrl}&timeSpan=${timeSpan}`;
  }
  return getTimeTable(id, requestUrl)
    .then(json => json.ArrivalBoard.Arrival)
    .then(transformTrips);
}

function getDeparturesFrom(id, timeSpan) {
  let requestUrl = `${travelPlanner}/departureBoard?id=${encodeURIComponent(
    id
  )}&format=json`;
  if (timeSpan) {
    requestUrl = `${requestUrl}&timeSpan=${timeSpan}`;
  }
  return (
    getTimeTable(id, requestUrl)
      .then(json => json.DepartureBoard.Departure || [])
      // .then(filterSimilar)
      .then(transformTrips)
  );
}

function getTimeTable(id, requestUrl) {
  return anropaVasttrafik(requestUrl).then(res => {
    const { error, errorText } = res;
    if (error || errorText) {
      console.log('Error:', error || errorText);
    }
    return res;
  });
}

function getLiveMap({ south, west, north, east }) {
  const getWGS84 = coord => Math.round(coord * 1000000);
  const url = `${travelPlanner}/livemap?minx=${getWGS84(west)}&miny=${getWGS84(
    south
  )}&maxx=${getWGS84(east)}&maxy=${getWGS84(north)}&onlyRealtime=yes`;
  return anropaVasttrafik(url).then(({ livemap }) => livemap.vehicles);
}

function getJourneyDetail(url) {
  return anropaVasttrafik(url).then(({ JourneyDetail }) => JourneyDetail);
}

function getGeometry(url) {
  return anropaVasttrafik(url).then(({ Geometry }) => Geometry);
}

function anropaVasttrafik(url, userHeaders) {
  const accessTokenPromise = Promise.resolve();
  const headers = {
    ...userHeaders,
    Authorization: `Bearer ${authToken}`
  };

  if (!expDate || expDate.getTime() < Date.now()) {
    console.log('Need to update authtoken');
    accessTokenPromise.then(getAccessToken);
  }

  return accessTokenPromise
    .then(() => fetch(url, { headers }))
    .then(fetchMiddleware);
}

function getClosestStops({ lat, lng }, limit = 5, retry = true) {
  const url = `${travelPlanner}/location.nearbystops?originCoordLat=${lat}&originCoordLong=${lng}&maxNo=${limit *
    2}&format=json`;
  return anropaVasttrafik(url)
    .then(json => {
      if (json.LocationList.errorText) {
        throw new Error(json.LocationList.errorText);
      }

      if (!json.LocationList.StopLocation) {
        return [];
      }

      return json.LocationList.StopLocation.filter(({ name }, index, self) => {
        const firstMatch = self.findIndex(stop => stop.name === name);
        return firstMatch === index;
      })
        .map(stop => ({
          ...stop,
          region: 'VT'
        }))
        .slice(0, limit);
    })
    .catch(reason => {
      if (retry) {
        console.log('[getClosestStops] error:', reason, 'retrying');
        getClosestStops({ lat, lng }, limit, false);
      } else {
        console.log('[getClosestStops] error', reason);
        throw reason;
      }
    });
}

function getAccessToken() {
  return fetch('https://api.vasttrafik.se:443/token', {
    headers: {
      Authorization:
        'Basic b1pZclV2c1ZGTG8zZ2FSemNaS0NUbEdJX21ZYTo4bTlLNnFsaDVNQXBWRFdRYlVWSUhneWZja3dh',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    body: 'grant_type=client_credentials'
  })
    .then(fetchMiddleware)
    .then(resp => {
      authToken = resp.access_token;
      expDate = new Date(Date.now() + resp.expires_in * 1000);
      console.log(`AuthToken expires ${expDate.toLocaleString()}`);
      return resp.access_token;
    });
}

function fetchMiddleware(response) {
  if (response.ok) return response.json();
  return response.json().then(err => Promise.reject(err));
}

function asArray(arg) {
  return arg ? [].concat(arg) : [];
}

const authTokenPromise = getAccessToken();

function init() {
  return authTokenPromise;
}

export default {
  init,
  getClosestStop: pos => getClosestStops(pos, 1),
  getClosestStops,
  findStops,
  getGeometry,
  getJourneyDetail,
  getTripSuggestion,
  getDeparturesFrom,
  getArrivalsTo,
  getTrafficSituations,
  getLiveMap,
  transformTrips
};
