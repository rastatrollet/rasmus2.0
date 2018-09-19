import 'fg-loadcss';
import bugsnag from 'bugsnag-js';
import Vue from 'vue';
import bugsnagVue from 'bugsnag-vue';

const bugsnagClient = bugsnag('3d7128669b3309e9907cceeae33c88d6');
bugsnagClient.use(bugsnagVue(Vue));

import App from './App.vue';
import store from './store';
import './registerServiceWorker';

// setup font awesome
import './components/FontAwesome';

Vue.config.productionTip = false;
store.dispatch('api/initApi');

new Vue({
  store,
  render: (h) => h(App)
}).$mount('#app');
