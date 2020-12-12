import codes from './trafikverketCodes';

const key = process.env.TV_KEY;
const auth = `<LOGIN authenticationkey="${key}" />`;
const stationMap = {};

const objectTypes = {
  TRAIN_STATION: 'TrainStation',
  TRAIN_MESSAGE: 'TrainMessage',
  TRAIN_ANNOUNCEMENT: 'TrainAnnouncement',
};

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
        <EQ name="TrafficImpact.AffectedLocation" value="${station}" />
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
  },
};

function tvApiRequest(objectType, { apiVersion = 1.3, schemaVersion } = {}, ...args) {
  if (apiVersion >= 2 && !schemaVersion) {
    throw Error('schemaVersion must be defined when apiVersion >= 2');
  }
  const query = `
  <QUERY
    objecttype="${objectType}"
    ${schemaVersion ? `schemaversion="${schemaVersion}"` : ''}
    ${objectType === objectTypes.TRAIN_ANNOUNCEMENT ? 'orderby="AdvertisedTimeAtLocation"' : ''}
  >
    ${api[objectType](...args)}
  </QUERY>`;

  return fetch(`https://api.trafikinfo.trafikverket.se/v${apiVersion}/data.json`, {
    body: `
      <REQUEST>
        ${auth}
        ${query}
      </REQUEST>
    `,
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/xml',
    },
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
    region: 'TV',
  });
}

function getClosestStops({ lat, lng }) {
  return tvApiRequest(objectTypes.TRAIN_STATION, {}, { lat, long: lng }, 5000).then((response) =>
    response.slice(0, 5).map(transformStation)
  );
}

let resolveStationMap;
let rejectStationMap;
const stationMapPromise = new Promise((resolve, reject) => {
  resolveStationMap = resolve;
  rejectStationMap = reject;
});

export default {
  init() {
    return tvApiRequest(objectTypes.TRAIN_STATION)
      .then((stations) => {
        stations.forEach((station) => {
          stationMap[station.LocationSignature] = station.AdvertisedLocationName;
        });
        return resolveStationMap(stationMap);
      })
      .catch(rejectStationMap);
  },
  getClosestStops,
  getClosestStop(pos) {
    return getClosestStops(pos).then((stops) => stops[0]);
  },
  getTrafficSituations(location) {
    return tvApiRequest(
      objectTypes.TRAIN_MESSAGE,
      { apiVersion: 2, schemaVersion: '1.6' },
      location
    )
      .then(logMiddleware)
      .then((situations) => {
        return {
          messages: situations.map(({ ExternalDescription, ReasonCode }) => {
            return (
              ExternalDescription +
              ` (${ReasonCode.map(
                ({ Code, Description }) => Description + ' - ' + atob(codes[Code])
              ).join(', ')})`
            );
          }),
        };
      });
  },
  async getDeparturesFrom(station) {
    return tvApiRequest(objectTypes.TRAIN_ANNOUNCEMENT, {}, station)
      .then((resp) => (resp || []).slice(0, 30))
      .then(logMiddleware)
      .then(async (deps) => {
        await stationMapPromise;
        return deps;
      })
      .then((deps) =>
        deps.map((dep) => ({
          ...dep,
          id: dep.ActivityId,
          direction: dep.ToLocation && (stationMap[dep.ToLocation[0].LocationName] || ''),
          via: dep.ViaToLocation && (stationMap[dep.ViaToLocation[0].LocationName] || ''),
          name: `${dep.ProductInformation.join(' ')}`,
          time: dep.AdvertisedTimeAtLocation.substr(-8, 5),
          timestamp: new Date(dep.AdvertisedTimeAtLocation).getTime(),
          isLate: false,
          track: dep.TrackAtLocation,
          sname: dep.ProductInformation[0],
        }))
      );
  },
  findStops(name) {
    return tvApiRequest(objectTypes.TRAIN_STATION, {}, { name }).then((stations) =>
      stations.slice(0, 15).map(transformStation)
    );
  },
  stationMap,
};
