const sheetsApi = {
  baseUrl: 'https://sheets.googleapis.com/v4/spreadsheets',
  API_KEY: 'AIzaSyBqEDcu-o3wuB8Fwn31yIF84qKwSIUIeEg'
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
  Textfärg: 'bgColor'
};

const files = {
  manualDepartures: {
    fileId: '1XSzg87FgHsxUl6UqNfRJtYIkw8wyN0yB3RzIib3JsvM',
    tabName: 'Manuella%20linjer'
  }
};

export function getManualDepartures() {
  const { fileId, tabName } = files.manualDepartures;
  return fetch(`${sheetsApi.baseUrl}/${fileId}/values/${tabName}?key=${sheetsApi.API_KEY}`)
    .then((resp) => resp.json())
    .then(({ values }) => {
      const [keys, ...rows] = values;
      const normalizedKeys = keys.map((key) => sweToVTLingo[key] || key);

      return rows.map((row) => {
        const trip = normalizedKeys.reduce(
          (res, key, i) => ({
            ...res,
            [key]: row[i]
          }),
          {}
        );

        trip.timestamp =
          trip.date && (trip.rtTime || trip.time)
            ? new Date(`${trip.date} ${trip.rtTime || trip.time}`).getTime()
            : Date.now();
        trip.bgColor = trip.bgColor || 'black';

        return trip;
      });
    });
}
