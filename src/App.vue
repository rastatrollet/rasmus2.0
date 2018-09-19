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
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

import InformationPage from './components/InformationPage.vue';
import DigitalClock from './components/DigitalClock.vue';
import StationInfo from './components/StationInfo.vue';
import Tabs from './components/Tabs.vue';

const baseTab = {
  icon: '',
  className: '',
  props: { arrivals: false },
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
    MapComponent: () => import('./components/Map.vue'),
    Tabs,
    StationInfo,
    DigitalClock,
    InformationPage
  },
  computed: {
    ...mapState({
      apiName: ({ api }) => api.name,
      initializing: ({ api }) => api.initializing
    }),
    ...mapState('tabs', ['currentTab']),
    ...mapGetters('api', ['api']),
    tabs() {
      return [
        {
          ...baseTab,
          name: this.apiName,
          small: true,
          onClick: this.toggleApi,
          initializing: this.initializing,
          className: this.apiName
        },
        ...components.map((comp) => ({
          ...baseTab,
          ...comp,
          disabled:
            comp.props &&
            comp.props.arrivals &&
            typeof this.api.getArrivalsTo !== 'function',
          onClick: this.changeTab
        }))
      ];
    },
    currentTabComponent() {
      return this.tabs.find(({ name }) => name === this.currentTab);
    }
  },
  methods: {
    ...mapMutations('trips', ['setArrivals']),
    ...mapMutations('tabs', ['setCurrentTab']),
    ...mapActions('api', ['toggleApi']),
    changeTab(tab, arrivals) {
      this.setArrivals(arrivals);
      this.setCurrentTab(tab);
    }
  }
};
</script>
<style>
:root {
  --brand-color: rgb(0, 157, 219);
  --brand-text-color: white;
  --brand-text-color-dim: rgba(255, 255, 255, 0.75);
  --dark-text-color: dimgray;
  --darker-text-color: rgb(0, 57, 77);
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

.from-tablet,
.from-desktop {
  display: none;
}

.VT {
  background-color: #ee7201;
}
.TV {
  background-color: #d12d2c;
}
.SL {
  background-color: #039cd5;
}

@media (min-width: 450px) {
  .from-tablet {
    display: initial;
  }
  .only-mobile {
    display: none;
  }
}

@media (min-width: 900px) {
  .from-desktop {
    display: initial;
  }
}
</style>
