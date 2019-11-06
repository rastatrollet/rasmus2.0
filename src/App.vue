<template>
  <div id="app">
    <UpdateAvailable />
    <InstallToHomeScreenPrompt />
    <OfflineIndicator />
    <Header />
    <div class="container">
      <component :is="currentTabComponent.componentName" v-bind="currentTabComponent.props" />
    </div>
    <div class="top-nav">
      <Tabs :tabs="tabs" :on-click="changeTab" :current-tab="currentTab" />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

import Header from './components/Header.vue';
import AppSettings from './components/AppSettings.vue';
import StationInfo from './components/StationInfo.vue';
import InstallToHomeScreenPrompt from './components/InstallToHomeScreenPrompt.vue';
import UpdateAvailable from './components/UpdateAvailable.vue';
import OfflineIndicator from './components/OfflineIndicator.vue';
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
    componentName: 'station-info',
    icon: ['fas', 'plane-departure']
  },
  {
    name: 'Ankomster',
    componentName: 'station-info',
    props: { arrivals: true },
    icon: ['fas', 'plane-arrival']
  },
  {
    name: 'Karta',
    componentName: 'map-component',
    icon: 'map'
  },
  {
    name: 'Inställningar',
    componentName: 'app-settings',
    icon: 'cog',
    small: true,
    onlyIcon: true
  }
];

export default {
  name: 'App',
  components: {
    Header,
    Tabs,
    StationInfo,
    AppSettings,
    MapComponent: () => import('./components/Map.vue'),
    UpdateAvailable,
    OfflineIndicator,
    InstallToHomeScreenPrompt
  },
  data() {
    return {
      timeoutId: null
    };
  },
  computed: {
    ...mapState({
      apiName: ({ api }) => api.name
    }),
    ...mapState('tabs', ['currentTab']),
    ...mapState('trips', ['location']),
    ...mapGetters('api', ['api']),
    tabs() {
      return components.map((comp) => ({
        ...baseTab,
        ...comp,
        disabled: comp.props && comp.props.arrivals && typeof this.api.getArrivalsTo !== 'function',
        onClick: this.changeTab
      }));
    },
    currentTabComponent() {
      return this.tabs.find(({ name }) => name === this.currentTab);
    }
  },
  watch: {
    location(newLoc, oldLoc) {
      if (!newLoc) {
        clearTimeout(this.timeoutId);
      } else if (newLoc.id !== (oldLoc && oldLoc.id)) {
        clearTimeout(this.timeoutId);
        this.getTripsAgainAndAgain();
      }
    },
    apiName() {
      if (this.currentTab === 'Ankomster' && typeof this.api.getArrivalsTo !== 'function') {
        this.setCurrentTab('Avgångar');
      }
    }
  },
  mounted() {
    if (this.location) {
      this.getTripsAgainAndAgain();
    }
  },
  methods: {
    ...mapMutations('trips', ['setArrivals']),
    ...mapMutations('tabs', ['setCurrentTab']),
    ...mapActions('trips', ['getTrips']),
    changeTab(tab, arrivals) {
      this.setArrivals(arrivals);
      this.setCurrentTab(tab);
    },
    getTripsAgainAndAgain() {
      window.requestAnimationFrame(() => {
        this.getTrips();
        this.timeoutId = setTimeout(() => this.getTripsAgainAndAgain(), 1000 * 30);
      });
    }
  }
};
</script>

<style>
:root {
  --brand-color: #04ace5; /* rgb(0, 157, 219); */
  --brand-text-color: white;
  --brand-text-color-dim: rgba(255, 255, 255, 0.75);
  --dark-text-color: dimgray;
  --darker-text-color: rgb(0, 57, 77);
}

html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: inherit;
}

body {
  background-color: var(--brand-color);
  color: var(--brand-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 0;
}

#app {
  background-color: var(--brand-text-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
}

.container {
  flex: 1;
  position: relative;
  width: 100vw;
  overflow: hidden;
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
