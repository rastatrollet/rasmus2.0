import getDestinationVia from '../util/getDestinationVia';

const initialFilter = {
  track: '',
  dest: '',
  timeSpan: ''
};
const initialSituations = {
  messages: [],
  affectedLines: []
};
const initialOptions = {
  isLive: true,
  voice: false
};
const filterKeys = Object.keys(initialFilter);
const optionKeys = Object.keys(initialOptions);

const state = {
  arrivals: false,
  filter: { ...initialFilter },
  options: { ...initialOptions },
  trips: [],
  situations: { ...initialSituations },
  isLoading: false,
  location: null
};

const getters = {
  filteredTrips({ trips, filter, situations }) {
    // return trips.filter(() => true);
    const { track, dest } = filter;
    const { affectedLines = [] } = situations;
    // TODO: make manual trips work
    // const now = Date.now();
    // const filteredManual = this.manualTrips
    //   .filter(({ origin }) => origin === this.location.name)
    //   .filter(({ timestamp }) => timestamp > now);
    // return [...filteredManual, ...filteredTrips]

    return trips
      .map((trip) => ({
        ...trip,
        isAffected: affectedLines.includes(trip.sname)
      }))
      .filter((trip) => (track ? trip.track === track : true))
      .filter(
        ({ direction, origin }) =>
          dest ? direction === dest || origin === dest : true
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }
};

const actions = {
  getTrips({ commit, state, rootGetters }, location) {
    const getTripsMethod = state.arrivals
      ? rootGetters['api/api']['getArrivalsTo']
      : rootGetters['api/api']['getDeparturesFrom'];
    commit('setLoading', true);
    return getTripsMethod(location.id, state.filter.timeSpan)
      .then((resp) => {
        const trips = resp.map(getDestinationVia);
        console.log('[getTrips]', trips);

        commit('setTrips', trips);
        commit('setLoading', false);
      })
      .catch((reason) => {
        console.error('[getTrips]', reason);
        commit('setLoading', false);
      });
  },
  getTrafficSituations({ commit, rootGetters }, location) {
    return rootGetters['api/api']
      .getTrafficSituations(location.id, 'stoparea') // WTF?
      .then((situations) => {
        console.log('situations', situations);
        commit('setSituations', situations);
      })
      .catch((reason) => console.error('[getTrafficSituations]', reason));
  },
  updateLocation({ dispatch, commit, state }, location) {
    if (state.location === location) return;

    console.log('[updateLocation]', location);
    commit('setLocation', location);
    dispatch('getTrips', location);
    dispatch('getTrafficSituations', location);
  }
};

const mutations = {
  reset(state) {
    state.trips = [];
    state.filter = { ...initialFilter };
    state.location = null;
    state.situations = { ...initialSituations };
  },
  setFilter(state, filter) {
    if (!Object.keys(filter).every((key) => filterKeys.includes(key))) {
      return console.error(
        '[setFilter]',
        'Non valid key(s) supplied, must be one of',
        filterKeys
      );
    }
    state.filter = {
      ...state.filter,
      ...filter
    };
  },
  setOptions(state, options) {
    if (!Object.keys(options).every((key) => optionKeys.includes(key))) {
      return console.error(
        '[setOptions]',
        'Non valid key(s) supplied, must be one of',
        optionKeys
      );
    }
    state.options = {
      ...state.options,
      ...options
    };
  },
  setTrips(state, trips) {
    state.trips = trips;
  },
  setSituations(state, situations) {
    state.situations = situations;
  },
  setLoading(state, value) {
    state.isLoading = value;
  },
  setLocation(state, location) {
    state.location = location;
  },
  setArrivals(state, value) {
    state.arrivals = value;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
