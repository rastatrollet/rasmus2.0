<template>
  <div id="app">
    <div class="top-nav">
      <Tabs
        :tabs="tabs"
        :on-click="changeTab"
        :current-tab="currentTab" />
      <DigitalClock />
    </div>
    <div class="container">
      <component
        :is="currentTabComponent.componentName"
        v-bind="currentTabComponent.props"/>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import DigitalClock from './components/DigitalClock.vue';
import StationInfo from './components/StationInfo.vue';
import Tabs from './components/Tabs.vue';
import MapComponent from './components/Map.vue';

const baseTab = {
  icon: '',
  props: {},
  onClick() {}
};
const components = [
  {
    name: 'Avgångar',
    componentName: 'station-info'
  },
  {
    name: 'Ankomster',
    componentName: 'station-info',
    props: { arrivals: true }
  },
  {
    name: 'Karta',
    componentName: 'map-component',
    icon: 'map'
  },
  {
    name: 'Info',
    componentName: 'information-page',
    icon: 'info-circle'
  }
];

export default {
  name: 'App',
  components: {
    MapComponent,
    Tabs,
    DigitalClock,
    StationInfo
  },
  data() {
    return {
      currentTab: 'Avgångar'
    };
  },
  computed: {
    ...mapState(['locationApi']),
    tabs() {
      return [
        {
          ...baseTab,
          name: this.locationApi,
          small: true,
          onClick: this.toggleApi
        },
        ...components.map((comp) => ({
          ...baseTab,
          ...comp,
          onClick: this.changeTab
        }))
      ];
    },
    currentTabComponent() {
      return this.tabs.find(({ name }) => name === this.currentTab);
    }
  },
  methods: {
    changeTab(tab) {
      this.currentTab = tab;
    },
    ...mapMutations(['toggleApi'])
  }
};
</script>
<style>
:root {
  --brand-color: rgb(0, 157, 219);
  --brand-text-color: white;
  --brand-text-color-dim: rgba(255, 255, 255, 0.75);
  --dark-text-color: dimgray;
}

html {
  box-sizing: border-box;
  height: 100%;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

body {
  font-family: system-ui, Helvetica Neue, sans-serif;
  color: var(--brand-color);
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

.container {
  height: calc(100% - 36px);
}
</style>
