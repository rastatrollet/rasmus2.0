const webpack = require('webpack');

module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ? '/rasmus2.0/' : '/',
  pwa: {
    themeColor: '#009ddb',
    msTileColor: '',
    appleMobileWebAppCapable: 'yes',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js'
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
