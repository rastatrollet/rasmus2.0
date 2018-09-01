import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const locationAPIs = ['SL', 'VT', 'TV'];

export default new Vuex.Store({
  state: {
    locationApi: locationAPIs[0]
  },
  mutations: {
    toggleApi(state) {
      const currentIndex = locationAPIs.indexOf(state.locationApi);
      const nextIndex = (currentIndex + 1) % locationAPIs.length;
      state.locationApi = locationAPIs[nextIndex];
    }
  },
  actions: {}
});
