import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import "./registerServiceWorker";

// font awesome setup
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMap, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faMap, faInfoCircle);
Vue.component("font-awesome", FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
