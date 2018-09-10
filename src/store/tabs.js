const state = {
  currentTab: 'Avgångar'
};

const mutations = {
  setCurrentTab(state, value) {
    state.currentTab = value;
  }
};

export default {
  namespaced: true,
  state,
  mutations
};
