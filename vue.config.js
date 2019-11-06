const webpack = require('webpack');

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
          urlPattern: new RegExp('^https://sheets.googleapis.com/v4/spreadsheets/'),
          handler: 'NetworkFirst',
          options: {
            networkTimeoutSeconds: 10,
            cacheName: 'google-sheets-api'
          }
        },
        {
          urlPattern: new RegExp('^https://rrp.vasttrafik.se/img'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'vasttrafik-images'
          }
        },
        {
          urlPattern: new RegExp('^https://unpkg.com/leaflet'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'leaflet-assets'
          }
        },
        {
          urlPattern: new RegExp('^https://\\w.tile.openstreetmap.org/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'map-images'
          }
        }
      ]
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.EnvironmentPlugin({
        BUILD_TIME: new Date().toUTCString()
      })
    ]
  }
};
