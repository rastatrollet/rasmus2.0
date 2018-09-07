import Vue from 'vue';
import Vuex from 'vuex';

import apis from '../api';
import user from './user';
import trips from './trips';
import stops from './stops';
import api from './api';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    selectedJourney: null,
    showJourneyDetails: false,
    loadingJourneyDetails: false
  },
  getters: {},
  mutations: {
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
    stops
  }
});
