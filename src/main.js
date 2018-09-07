import 'fg-loadcss';
import Vue from 'vue';

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
