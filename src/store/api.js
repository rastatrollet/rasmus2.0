import apis, { apiDict } from '../api';

const locationAPIs = ['SL', 'VT', 'TV'];
const defaultApi = locationAPIs[1];

const state = {
  name: defaultApi
};

const getters = {
  api({ name }) {
    return apis[name];
  },
  dict({ name }) {
    return apiDict[name];
  }
};

const mutations = {
  toggleApi(state) {
    const currentIndex = locationAPIs.indexOf(state.name);
    const nextIndex = (currentIndex + 1) % locationAPIs.length;
    state.name = locationAPIs[nextIndex];
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations
};
