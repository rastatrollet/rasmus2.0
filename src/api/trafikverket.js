const auth = '<LOGIN authenticationkey="2dfa6ea579bd45e3ac3810eb1a97adb6" />';
const stationMap = {};

const api = {
  TrainStation({ lat, long, name } = {}, radius = 500) {
    // station close to
    if (name) {
      return `
        <FILTER>
          <AND>
            <LIKE name="AdvertisedLocationName" value="/^${name}/" />
            <EQ name="Advertised" value="true" />
          </AND>
        </FILTER>
      `;
    }

    if (lat && long) {
      return `
        <FILTER>
          <AND>
            <WITHIN name="Geometry.WGS84" shape="center" value="${long} ${lat}" radius="${radius}m" />
            <EQ name="Advertised" value="true" />
          </AND>
        </FILTER>
      `;
    }

    return '<FILTER />';
  },
  TrainMessage(station) {
    // message at station
    return `
      <FILTER>
        <EQ name="AffectedLocation" value="${station}" />
      </FILTER>
    `;
  },
  TrainAnnouncement(station) {
    // departures at station
    return `
      <FILTER>
        <AND>
          <EQ name="Advertised" value="true" />
          <EQ name="ActivityType" value="Avgang" />
          <EQ name="LocationSignature" value="${station}" />
          <GT name="AdvertisedTimeAtLocation" value="$dateadd(00:00:00)" />
          <LT name="AdvertisedTimeAtLocation" value="$dateadd(05:00:00)" />
        </AND>
      </FILTER>
    `;
  }
};

function tvApiRequest(objectType, ...args) {
  return fetch('https://api.trafikinfo.trafikverket.se/v1.3/data.json', {
    body: `
      <REQUEST>
        ${auth}
        <QUERY objecttype="${objectType}" ${
      objectType === 'TrainAnnouncement'
        ? 'orderby="AdvertisedTimeAtLocation"'
        : ''
    }>
          ${api[objectType](...args)}
        </QUERY>
      </REQUEST>
    `,
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/xml'
    }
  })
    .then((resp) => {
      const jsonPromise = resp.json().then((json) => json.RESPONSE.RESULT);
      if (resp.ok) return jsonPromise;
      return jsonPromise.then((err) => Promise.reject(err));
    })
    .then((json) => json[0][objectType] || [])
    .catch((err) => console.error(err));
}

function logMiddleware(resp) {
  console.log(resp || 'No results');
  return resp;
}

function transformStation(station) {
  return Object.assign({}, station, {
    name: station.AdvertisedLocationName,
    id: station.LocationSignature,
    region: 'TV'
  });
}

function getClosestStops({ lat, lng }) {
  return tvApiRequest('TrainStation', { lat, long: lng }, 5000).then(
    (response) => response.slice(0, 5).map(transformStation)
  );
}

export default {
  init() {
    return tvApiRequest('TrainStation').then((stations) =>
      stations.forEach((station) => {
        stationMap[station.LocationSignature] = station.AdvertisedLocationName;
      })
    );
  },
  getClosestStops,
  getClosestStop(pos) {
    return getClosestStops(pos).then((stops) => stops[0]);
  },
  getTrafficSituations(location) {
    return tvApiRequest('TrainMessage', location)
      .then(logMiddleware)
      .then((situations) => ({
        messages: situations.map(
          ({ ExternalDescription }) => ExternalDescription
        )
      }));
  },
  getDeparturesFrom(station) {
    return tvApiRequest('TrainAnnouncement', station)
      .then((resp) => (resp || []).slice(0, 30))
      .then(logMiddleware)
      .then((deps) =>
        deps.map((dep) => ({
          ...dep,
          id: dep.ActivityId,
          direction:
            dep.ToLocation &&
            (stationMap[dep.ToLocation[0].LocationName] || ''),
          via:
            dep.ViaToLocation &&
            (stationMap[dep.ViaToLocation[0].LocationName] || ''),
          name: `${dep.ProductInformation.join(' ')}`,
          time: dep.AdvertisedTimeAtLocation.substr(-8, 5),
          timestamp: new Date(dep.AdvertisedTimeAtLocation).getTime(),
          isLate: false,
          track: dep.TrackAtLocation,
          sname: dep.ProductInformation[0]
        }))
      );
  },
  findStops(name) {
    return tvApiRequest('TrainStation', { name }).then((stations) =>
      stations.slice(0, 15).map(transformStation)
    );
  },
  stationMap
};
