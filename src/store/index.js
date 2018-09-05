import Vue from 'vue';
import Vuex from 'vuex';

import apis from '../api';
import user from './user';
import trips from './trips';
import stops from './stops';

Vue.use(Vuex);

const locationAPIs = ['SL', 'VT', 'TV'];

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    locationApi: 'VT',
    selectedJourney: null,
    showJourneyDetails: false,
    loadingJourneyDetails: false
  },
  getters: {
    api({ locationApi }) {
      return apis[locationApi];
    }
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
    setShowJourneyDetails(state, value) {
      state.showJourneyDetails = value;
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
      commit('setShowJourneyDetails', true);
      commit('setLoadingJourneyDetails', true);
      apis.VT.getJourneyDetail(trip.JourneyDetailRef.ref)
        .then((resp) => {
          console.log('got details', resp);
          commit('selectJourney', resp);
          commit('setLoadingJourneyDetails', false);
        })
        .catch((reason) => {
          console.log('error getting journey details', reason);
          commit('setLoadingJourneyDetails', false);
        });
    }
  },
  modules: {
    user,
    trips,
    stops
  }
});
