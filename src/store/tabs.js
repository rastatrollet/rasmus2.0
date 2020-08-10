export const tabs = [
  {
    name: 'Hållplats',
    componentName: 'station-info',
    icon: ['fas', 'map-marker-alt']
  },
  {
    name: 'Karta',
    componentName: 'map-component',
    icon: 'map'
  },
  // {
  //   name: 'Störningar',
  //   componentName: 'disturbance-component',
  //   icon: 'exclamation-circle'
  // },
  {
    name: 'Inställningar',
    componentName: 'app-settings',
    icon: 'cog',
    small: true,
    onlyIcon: true
  }
];

const state = {
  currentTab: tabs[0].name
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
