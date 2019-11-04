const state = {
  isSupported: 'geolocation' in navigator,
  isLoading: {
    location: false,
    nearbyStops: false
  },
  location: null,
  consented: null,
  nearbyStops: [],
  nearbyStopsError: ''
};

const getters = {
  isLoading({ isLoading }) {
    return isLoading.location || isLoading.nearbyStops;
  }
};

const actions = {
  async getNearbyStops({ commit, dispatch, state, rootState, rootGetters }) {
    if (!state.isSupported) return;
    if (!state.location) {
      await dispatch('getUserLocation');
    }

    commit('setLoading', { nearbyStops: true });
    rootGetters['api/api']
      .getClosestStops(state.location)
      .then((nearbyStops) => {
        // only update nearbyStations promise resolves with correct data
        console.log('nearbySyops', nearbyStops);
        if (nearbyStops && nearbyStops.length && nearbyStops[0].region === rootState.api.name) {
          commit('setNearbyStops', nearbyStops);
        } else {
          commit('setNearbyStopsError', 'Hittade ingen närliggande hållplats 😥');
          setTimeout(() => commit('setNearbyStopsError', ''), 7000);
        }
        commit('setLoading', { nearbyStops: false });
      })
      .catch((reason) => {
        console.error(reason);
        commit('setLoading', { nearbyStops: false });
        commit('setNearbyStopsError', 'Något gick snett 😱');
      });
  },
  getUserLocation({ commit, state }) {
    if (!state.isSupported) return Promise.resolve();

    commit('setLoading', { location: true });
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    })
      .then((pos) => {
        commit('setLoading', { location: false });
        commit('setConsented', true);
        commit('setLocation', pos.coords);
      })
      .catch((reason) => {
        console.error(reason);
        commit('setLoading', { location: false });
        commit('setConsented', false);
      });
  }
};

const mutations = {
  setLoading(state, loading) {
    state.isLoading = {
      ...state.loading,
      ...loading
    };
  },
  setConsented(state, value) {
    state.consented = value;
  },
  setLocation(state, coords) {
    state.location = {
      lat: coords.latitude,
      lng: coords.longitude
    };
  },
  setNearbyStops(state, stops) {
    state.nearbyStops = stops;
    state.nearbyStopsError = '';
  },
  setNearbyStopsError(state, error) {
    state.nearbyStopsError = error;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
