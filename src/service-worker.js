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
