/* eslint-env serviceworker */
/* global workbox */

workbox.core.setCacheNameDetails({ prefix: 'Resmus' });

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(
  new RegExp('https://sheets.googleapis.com/v4/spreadsheets/'),
  workbox.strategies.networkFirst({
    cacheName: 'google-sheets-api'
  })
);

workbox.routing.registerRoute(
  new RegExp('https://rrp.vasttrafik.se/img'),
  workbox.strategies.cacheFirst({
    cacheName: 'vasttrafik-images'
  })
);

workbox.routing.registerRoute(
  new RegExp('https://unpkg.com/leaflet'),
  workbox.strategies.cacheFirst({
    cacheName: 'leaflet-assets'
  })
);

workbox.routing.registerRoute(
  new RegExp('tile.openstreetmap.org/'),
  workbox.strategies.cacheFirst({
    cacheName: 'map-images'
  })
);

// workbox.addEventListener('waiting', (event) => {
//   console.log('event.wasWaitingBeforeRegister', event.wasWaitingBeforeRegister);
//   // `event.wasWaitingBeforeRegister` will be false if this is
//   // the first time the updated service worker is waiting.
//   // When `event.wasWaitingBeforeRegister` is true, a previously
//   // updated same service worker is still waiting.
//   // You may want to customize the UI prompt accordingly.

//   if (window.confirm('Reload to update?')) {
//     workbox.addEventListener('controlling', () => {
//       window.location.reload();
//     });
//     workbox.messageSW({ type: 'SKIP_WAITING' });
//   }
// });

addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    skipWaiting();
  }
});
