const state = {
  filter: {},
  options: {
    isLive: true,
    voice: false
  },
  trips: [],
  isLoading: false,
  location: null
};

const getters = {
  filteredTrips({ trips }) {
    return trips.filter(() => true);
  }
};

const actions = {
  getTrips() {}
};

const mutations = {
  setFilter(state, filter) {
    state.filter = {
      ...state.filter,
      ...filter
    };
  },
  setOptions(state, options) {
    state.options = {
      ...state.options,
      ...options
    };
  },
  setTrips(state, trips) {
    state.trips = trips;
  },
  setLoading(state, value) {
    state.isLoading = value;
  },
  setLocation(state, location) {
    state.location = location;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
