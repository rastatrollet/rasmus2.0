const sheetsApi = {
  baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
  API_KEY: 'AIzaSyBqEDcu-o3wuB8Fwn31yIF84qKwSIUIeEg',
};

const sweToVTLingo = {
  Linje: 'sname',
  Hpl: 'origin',
  Till: 'direction',
  Via: 'via',
  Läge: 'track',
  Anm: 'remark',
  Tid: 'time',
  'Ny tid': 'rtTime',
  Datum: 'date',
  Bakgrundsfärg: 'fgColor',
  Textfärg: 'bgColor',
};

const files = {
  manualDepartures: {
    fileId: '1XSzg87FgHsxUl6UqNfRJtYIkw8wyN0yB3RzIib3JsvM',
    tabName: 'Manuella%20linjer',
  },
  trafficInformation: {
    fileId: '1XSzg87FgHsxUl6UqNfRJtYIkw8wyN0yB3RzIib3JsvM',
    tabName: 'Trafikinformation',
  },
};

function getSheet({ fileId, tabName }) {
  return fetch(
    `${sheetsApi.baseUrl}/${fileId}/values/${tabName}?key=${sheetsApi.API_KEY}`
  ).then((resp) => resp.json());
}

function zipObject(keys) {
  return (row) =>
    keys.reduce(
      (res, key, i) => ({
        ...res,
        [key]: row[i],
      }),
      {}
    );
}

export function getManualDepartures() {
  return getSheet(files.manualDepartures).then(({ values }) => {
    const [keys, ...rows] = values;
    const normalizedKeys = keys.map((key) => sweToVTLingo[key] || key);

    return rows.map(zipObject(normalizedKeys)).map((trip) => {
      const time = trip.rtTime || trip.time;
      const hasDateTime = trip.date && time;

      trip.timestamp = hasDateTime ? new Date(`${trip.date} ${time}`).getTime() : Date.now();
      trip.bgColor = trip.bgColor || 'black';

      return trip;
    });
  });
}

export function getManualInformation() {
  return getSheet(files.trafficInformation).then(({ values }) => {
    const [, ...rows] = values;
    const normalizedKeys = ['location', 'message', 'validFrom', 'validUntil'];

    return rows.map(zipObject(normalizedKeys)).map((info) => {
      info.validFrom = new Date(info.validFrom);
      info.validUntil = new Date(info.validUntil);
      return info;
    });
  });
}
