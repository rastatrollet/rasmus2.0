import getDestinationVia from '../util/getDestinationVia';
// import { speak } from '../util/speechSynthesis';

const state = {
  arrivals: false,
  filter: {
    track: '',
    dest: '',
    timeSpan: ''
  },
  options: {
    isLive: true,
    voice: false
  },
  trips: [],
  situations: {
    messages: [],
    affectedLines: []
  },
  isLoading: false,
  location: null
};

const getters = {
  filteredTrips({ trips, filter, situations }) {
    // return trips.filter(() => true);
    const { track, dest } = filter;
    const { affectedLines = [] } = situations;
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
  },
  destinations({ trips }) {
    return Array.from(
      new Set(trips.map(({ direction, origin }) => direction || origin))
    );
  },
  tracks({ trips }) {
    return Array.from(new Set(trips.map(({ track }) => track)));
  }
};

const actions = {
  speakOut() {
    // if (this.filteredTrips.length) {
    //   const { name, direction, timestamp } = this.filteredTrips[0];
    //   const inMinutes = Math.ceil((timestamp - Date.now()) / (1000 * 60));
    //   if (this.voice) {
    //     if (inMinutes <= 0) {
    //       speak(`${name} mot ${direction}, avgår nu`);
    //     } else if (inMinutes === 1) {
    //       speak(`${name} mot ${direction}, avgår om en minut`);
    //     } else if (inMinutes > 1 && inMinutes <= 60) {
    //       speak(
    //         `${name} mot ${direction}, avgår om ${inMinutes} minuter`
    //       );
    //     } else {
    //       speak(`${name} mot ${direction}, avgår om mer än en timma`);
    //     }
    //   }
    // }
  },
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
