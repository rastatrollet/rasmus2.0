import 'fg-loadcss';
import Vue from 'vue';
import bugsnagVue from 'bugsnag-vue';
import bugsnagClient from './util/bugsnag';

bugsnagClient.use(bugsnagVue(Vue));

import App from './App.vue';
import store from './store';
import './registerServiceWorker';

// setup font awesome
import './components/FontAwesome';

Vue.config.productionTip = false;
store.dispatch('api/initApi');
store.dispatch('trips/loadManualDepartures');

new Vue({
  store,
  render: (h) => h(App)
}).$mount('#app');
