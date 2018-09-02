import Vue from 'vue';
import Vuex from 'vuex';
import api from './api';

Vue.use(Vuex);

const locationAPIs = ['SL', 'VT', 'TV'];

export default new Vuex.Store({
  state: {
    locationApi: 'VT',
    selectedJourney: null,
    loadingJourneyDetails: false
  },
  mutations: {
    toggleApi(state) {
      const currentIndex = locationAPIs.indexOf(state.locationApi);
      const nextIndex = (currentIndex + 1) % locationAPIs.length;
      state.locationApi = locationAPIs[nextIndex];
    },
    selectJourney(state, journey) {
      state.selectedJourney = journey;
    },
    setLoadingJourneyDetails(state, value) {
      state.loadingJourneyDetails = value;
    }
  },
  actions: {
    getJourneyDetails({ commit, state }, trip) {
      if (state.locationApi !== 'VT' || !trip.JourneyDetailRef) {
        return Promise.resolve();
      }
      console.log('get details');
      commit('setLoadingJourneyDetails', true);
      api.VT.getJourneyDetail(trip.JourneyDetailRef.ref)
        .then((resp) => {
          console.log('got details');
          commit('selectJourney', resp.Stop);
          commit('setLoadingJourneyDetails', false);
        })
        .catch((reason) => {
          console.log('error getting journey details', reason);
          commit('setLoadingJourneyDetails', false);
        });
    }
  }
});
