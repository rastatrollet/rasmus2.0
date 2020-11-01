const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/rasmus2.0/' : '/',
  pwa: {
    themeColor: '#009ddb',
    msTileColor: '',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    workboxPluginMode: 'GenerateSW',
    workboxOptions: {
      swDest: 'service-worker.js',
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /img/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'local-images',
          },
        },
        {
          urlPattern: new RegExp('^https://sheets.googleapis.com/v4/spreadsheets/'),
          handler: 'NetworkFirst',
          options: {
            networkTimeoutSeconds: 10,
            cacheName: 'google-sheets-api',
          },
        },
        {
          urlPattern: new RegExp('^https://rrp.vasttrafik.se/img'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'vasttrafik-images',
          },
        },
        {
          urlPattern: new RegExp('^https://unpkg.com/leaflet'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'leaflet-assets',
          },
        },
        {
          urlPattern: new RegExp('^https://\\w.tile.openstreetmap.org/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'map-images',
          },
        },
      ],
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.EnvironmentPlugin({
        BUILD_TIME: new Date().toUTCString(),
        SL_NEARBY_STOPS_KEY: process.env.SL_NEARBY_STOPS_KEY,
        SL_TYPE_AHEAD_KEY: process.env.SL_TYPE_AHEAD_KEY,
        SL_REALTIME_DEPARTURES_KEY: process.env.SL_REALTIME_DEPARTURES_KEY,
        SL_DEVIATIONS_KEY: process.env.SL_DEVIATIONS_KEY,
        VT_BASIC_AUTH: process.env.VT_BASIC_AUTH,
        TV_KEY: process.env.TV_KEY,
        RESROBOT_RESEPLANERARE_KEY: process.env.RESROBOT_RESEPLANERARE_KEY,
        RESROBOT_STOLPTIDTABELLER_KEY: process.env.RESROBOT_STOLPTIDTABELLER_KEY,
      }),
    ],
  },
};
