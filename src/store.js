import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const locationAPIs = ['VT', 'TV'];

export default new Vuex.Store({
  state: {
    locationApi: locationAPIs[0]
  },
  mutations: {
    toggleApi(state) {
      state.locationApi = locationAPIs.find(api => api !== state.locationApi);
    }
  },
  actions: {}
});
