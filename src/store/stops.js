const state = {
  stops: [],
  isLoading: false,
  favorites: [],
};

const getters = {};

let lastQuery;
const actions = {
  findStops({ commit, rootGetters }, query) {
    if (!query) return commit('setStops', []);
    lastQuery = query;

    commit('setLoading', true);
    return rootGetters['api/api']
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
  },
  addFavorite({ commit, state }, favorite) {
    commit('setFavorites', [...state.favorites, favorite]);
  },
  removeFavorite({ commit, state }, favorite) {
    const remainingFavorites = state.favorites.filter((fav) => {
      const toBeRemoved = fav.id === favorite.id && fav.name === favorite.name;
      return !toBeRemoved;
    });
    commit('setFavorites', remainingFavorites);
  },
};

const mutations = {
  setStops(state, stops) {
    state.stops = stops;
  },
  setLoading(state, value) {
    state.isLoading = value;
  },
  setFavorites(state, favorites) {
    state.favorites = favorites;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
