import apis, { apiDict } from '../api';

const locationAPIs = Object.keys(apis);
const defaultApi = 'VT'; // Västtrafik
if (!locationAPIs.includes(defaultApi)) {
  throw new Error('defaultApi must exist');
}

const initializedAPIs = [];

const state = {
  name: defaultApi,
  initializing: true,
};

const getters = {
  api({ name }) {
    return apis[name];
  },
  dict({ name }) {
    return apiDict[name];
  },
};

const mutations = {
  setApi(state, value) {
    state.name = value;
  },
  setInitializing(state, value) {
    state.initializing = value;
  },
};

const actions = {
  initApi({ commit, state }) {
    console.info('initializing', state.name);
    commit('setInitializing', true);
    apis[state.name]
      .init()
      .then(() => {
        commit('setInitializing', false);
        initializedAPIs.push(state.name);
      })
      .catch((reason) => {
        console.error('[initApi]', reason);
        commit('setInitializing', false);
      });
  },
  toggleApi({ state, commit, dispatch }, next) {
    const currentIndex = locationAPIs.indexOf(state.name);
    const nextIndex = (currentIndex + 1) % locationAPIs.length;
    const apiName = next || locationAPIs[nextIndex];
    const isInitialized = initializedAPIs.includes(apiName);

    commit('setApi', apiName);
    commit('trips/reset', null, { root: true });
    commit('stops/setStops', [], { root: true });
    if (!isInitialized) dispatch('initApi');
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
