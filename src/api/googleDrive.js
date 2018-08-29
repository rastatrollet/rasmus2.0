/* globals gapi */

const CLIENT_ID =
  "499673240843-8f8bn77590948esm040d5cl5s4k32hkq.apps.googleusercontent.com";
const API_KEY = "AIzaSyAQVyCYvuXOxLcIMlT68G-ELLSxMVDqDGc";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
];
const SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly"
].join(" ");
const sweToVTLingo = {
  Datum: "date",
  Hållplats: "origin",
  Linje: "sname",
  Namn: "direction",
  Tid: "time",
  "Ny tid": "rtTime",
  Läge: "track",
  Bakgrund: "fgColor"
};
const files = {
  infoDoc: {
    fileId: "1TRE1P4EmB3kwlURit8lICniBtRp7aqnhcU8x7D6yzqI",
    mimeType: "text/html"
  },
  manualDepartures: {
    fileId: "1XSzg87FgHsxUl6UqNfRJtYIkw8wyN0yB3RzIib3JsvM",
    mimeType: "text/tab-separated-values"
  }
};

/**
 *  On load, called to load the auth2 library and API client library.
 */
window.handleClientLoad = function handleClientLoad() {
  gapi.load("client:auth2", initClient);
};

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
let resolveGooglePromise;
let rejectGooglePromise;
const googleInitPromise = new Promise((resolve, reject) => {
  resolveGooglePromise = resolve;
  rejectGooglePromise = reject;
}).then(() => {
  // Listen for sign-in state changes.
  // gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
  // Handle the initial sign-in state.
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    return gapi.auth2.getAuthInstance().signIn();
  }
});

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    })
    .then(() => console.log("gapi initiated"))
    .then(resolveGooglePromise)
    .catch(rejectGooglePromise);
}

function printInfoDoc() {
  return googleInitPromise.then(() =>
    getFile(files.infoDoc)
      .then(printFile)
      .catch(e => console.error(e))
  );
}

function getManualDepartures() {
  return googleInitPromise.then(() =>
    getFile(files.manualDepartures)
      .then(({ body }) => body)
      .then(csv => {
        const rows = csv.split(/\n/);
        const keys = rows[0].replace(/\n|\r/g, "").split(/\t/);
        return rows.slice(1).map(row => {
          const values = row.split(/\t/);
          return keys.reduce((res, curr, idx) => {
            const key = sweToVTLingo[curr] || curr;
            res[key] = values[idx];
            return res;
          }, {});
        });
      })
  );
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
// function updateSigninStatus(isSignedIn) {
//   if (isSignedIn) {
//   } else {
//     gapi.auth2
//       .getAuthInstance()
//       .signIn()
//       .then(() => console.log("signed in"));
//   }
// }

/**
 * getFile
 */
function getFile(options) {
  return gapi.client.drive.files.export(options);
}

/**
 * Print file
 */
function printFile(response) {
  const content = response.body.match(/<body[^>]*>(.*)<\/body><\/html>$/)[1];
  const doc = document.getElementById("gdoc");
  doc.innerHTML = content;
}

export default {
  printInfoDoc,
  getManualDepartures
};
