const webpack = require('webpack');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/rasmus2.0/' : '/',
  pwa: {
    themeColor: '#009ddb',
    msTileColor: '',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/service-worker.js',
      skipWaiting: true,
      clientsClaim: true
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
