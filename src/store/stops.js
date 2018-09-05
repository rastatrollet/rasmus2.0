const state = {
  stops: [],
  isLoading: false
};

const getters = {};

let lastQuery;
const actions = {
  findStops({ commit, rootGetters }, query) {
    if (!query) return commit('setStops', []);
    lastQuery = query;

    commit('setLoading', true);
    return rootGetters.api
      .findStops(query)
      .then((stops) => {
        console.log('stops', stops);
        if (lastQuery === query) {
          commit('setLoading', false);
          commit('setStops', stops);
        } else {
          console.log('skipping response');
        }
        return stops;
      })
      .catch((reason) => {
        console.error(reason);
        commit('setLoading', false);
      });
  }
};

const mutations = {
  setStops(state, stops) {
    state.stops = stops;
  },
  setLoading(state, value) {
    state.isLoading = value;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
