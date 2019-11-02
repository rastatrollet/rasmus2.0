/* globals gapi */

const sheetsApi = {
  API_KEY: 'AIzaSyBqEDcu-o3wuB8Fwn31yIF84qKwSIUIeEg'
};

const driveApi = {
  apiKey: 'AIzaSyAQVyCYvuXOxLcIMlT68G-ELLSxMVDqDGc',
  clientId:
    '499673240843-8f8bn77590948esm040d5cl5s4k32hkq.apps.googleusercontent.com',
  discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
  scope: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ].join(' ')
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
  infoDoc: {
    fileId: '1TRE1P4EmB3kwlURit8lICniBtRp7aqnhcU8x7D6yzqI',
    mimeType: 'text/html'
  },
  manualDepartures: {
    fileId: '1XSzg87FgHsxUl6UqNfRJtYIkw8wyN0yB3RzIib3JsvM',
    tabName: 'Manuella%20linjer'
  }
};

let initialized = false;
async function init() {
  if (initialized) return;
  const script = document.createElement('script');
  script.addEventListener('load', () => {
    initialized = true;
    gapi.load('client:auth2', initClient);
  });
  script.src = 'https://apis.google.com/js/api.js';
  document.body.appendChild(script);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
let resolveGooglePromise;
let rejectGooglePromise;
const googleInitPromise = new Promise((resolve, reject) => {
  resolveGooglePromise = resolve;
  rejectGooglePromise = reject;
});

async function initClient() {
  try {
    await gapi.client.init(driveApi);
  } catch (error) {
    console.log('error init gapi', error);
    return rejectGooglePromise(error);
  }

  // Listen for sign-in state changes.
  gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
  // Handle the initial sign-in state.

  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    return resolveGooglePromise();
  }

  gapi.auth2.getAuthInstance().signIn();
  resolveGooglePromise();
}

function printInfoDoc(elementId) {
  init();
  return googleInitPromise.then(() =>
    getFile(files.infoDoc)
      .then((response) => printFile(response, elementId))
      .catch((e) => console.error(e))
  );
}

function getManualDepartures() {
  return fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${
      files.manualDepartures.fileId
    }/values/${files.manualDepartures.tabName}?key=${sheetsApi.API_KEY}`
  )
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

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
async function updateSigninStatus(isSignedIn) {
  if (isSignedIn) return;

  gapi.auth2
    .getAuthInstance()
    .signIn()
    .then(resolveGooglePromise);
}

/**
 * getFile
 */
function getFile(options) {
  return gapi.client.drive.files.export(options);
}

/**
 * Print file
 */
function printFile(response, elementId) {
  const content = response.body.match(/<body[^>]*>(.*)<\/body><\/html>$/)[1];
  const doc = document.getElementById(elementId);
  doc.innerHTML = content;
}

export default {
  init,
  printInfoDoc,
  getManualDepartures
};
