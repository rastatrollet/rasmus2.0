import 'fg-loadcss';
import Vue from 'vue';

import App from './App.vue';
import store from './store';
import './registerServiceWorker';

// setup font awesome
import './components/FontAwesome';

Vue.config.productionTip = false;

new Vue({
  store,
  render: (h) => h(App)
}).$mount('#app');
