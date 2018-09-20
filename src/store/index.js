import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';

import apis from '../api';
import user from './user';
import trips from './trips';
import stops from './stops';
import tabs from './tabs';
import api from './api';

Vue.use(Vuex);
const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  reducer: (state) => ({
    trips: state.trips,
    api: state.api
  })
});

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    online: true,
    selectedJourney: null,
    updateAvailable: false,
    showJourneyDetails: false,
    loadingJourneyDetails: false
  },
  getters: {},
  mutations: {
    setOnline(state, value) {
      state.online = value;
    },
    setUpdateAvailable(state, value) {
      state.updateAvailable = value;
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
      if (state.api.name !== 'VT' || !trip.JourneyDetailRef) {
        console.log('[getJourneyDetails]', 'only available for VT');
        return Promise.resolve();
      }
      commit('setShowJourneyDetails', true);
      commit('setLoadingJourneyDetails', true);
      apis.VT.getJourneyDetail(trip.JourneyDetailRef.ref)
        .then((resp) => {
          commit('selectJourney', resp);
          commit('setLoadingJourneyDetails', false);
        })
        .catch((reason) => {
          console.error('[getJourneyDetails]', reason);
          commit('setLoadingJourneyDetails', false);
        });
    }
  },
  modules: {
    api,
    user,
    trips,
    stops,
    tabs
  },
  plugins: [vuexLocal.plugin]
});
