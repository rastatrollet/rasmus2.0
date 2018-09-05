import api from '../apis';

const state = {
  trip: null,
  error: null,
  isLoading: false
};

const getters = {};

const actions = {
  getTrip({ commit, rootState }, trip) {
    if (rootState.api.current !== 'VT' || !trip.JourneyDetailRef) {
      return Promise.resolve();
    }

    commit('setLoading', true);
    api.VT.getJourneyDetail(trip.JourneyDetailRef.ref)
      .then((resp) => {
        commit('setTrip', resp);
        commit('setError', null);
        commit('setLoading', false);
      })
      .catch((reason) => {
        commit('setError', reason);
        commit('setLoading', false);
      });
  }
};

const mutations = {
  setTrip(state, trip) {
    state.trip = trip;
  },
  setLoading(state, value) {
    state.isLoading = Boolean(value);
  },
  setError(state, error) {
    state.error = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
