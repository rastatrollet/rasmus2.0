<template>
  <div id="app" :class="$style.app">
    <Header />
    <div :class="$style.container">
      <component :is="currentTabComponent.componentName" />
      <AppSettings :class="[$style.appSettings, showSettings && $style.appSettingsVisible]" />
    </div>
    <nav :class="$style.nav">
      <Tabs :tabs="tabs" :current-tab="currentTab" :show-settings="showSettings" />
    </nav>
    <UpdateAvailable />
    <InstallToHomeScreenPrompt />
    <OfflineIndicator />
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
import { tabs as components } from './store/tabs';

export default {
  name: 'App',
  components: {
    Header,
    Tabs,
    StationInfo,
    AppSettings,
    MapComponent: () => import('./components/Map.vue'),
    DisturbanceComponent: () => import('./components/Disturbance.vue'),
    UpdateAvailable,
    OfflineIndicator,
    InstallToHomeScreenPrompt,
  },
  data() {
    return {
      timeoutId: null,
      showSettings: false,
    };
  },
  computed: {
    ...mapState({
      apiName: ({ api }) => api.name,
    }),
    ...mapState('tabs', ['currentTab']),
    ...mapState('trips', ['location']),
    ...mapGetters('api', ['api']),
    tabs() {
      return components.map((comp) => ({
        ...comp,
        onClick: this.changeTab,
      }));
    },
    currentTabComponent() {
      return this.tabs.find(({ name }) => name === this.currentTab);
    },
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
      if (typeof this.api.getArrivalsTo !== 'function') {
        this.setArrivals(false);
      }
    },
  },
  mounted() {
    if (this.location) {
      this.getTripsAgainAndAgain();
    }
  },
  methods: {
    ...mapMutations('tabs', ['setCurrentTab']),
    ...mapMutations('trips', ['setArrivals']),
    ...mapActions('trips', ['getTrips']),
    toggleSettings() {
      this.showSettings = !this.showSettings;
    },
    changeTab({ name }) {
      if (name === 'Inställningar') {
        this.toggleSettings();
      } else {
        this.showSettings = false;
        this.setCurrentTab(name);
      }
    },
    getTripsAgainAndAgain() {
      window.requestAnimationFrame(() => {
        this.getTrips();
        this.timeoutId = setTimeout(() => this.getTripsAgainAndAgain(), 1000 * 30);
      });
    },
  },
};
</script>

<style module>
.app {
  background-color: var(--background-color);
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

.appSettings {
  transition: transform 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  will-change: transform;
  transform: translateX(101%);

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999; /* to overlay map */
}
.appSettingsVisible {
  pointer-events: initial;
  transform: translateX(0);
}

@supports (-webkit-overflow-scrolling: touch) {
  .container {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
</style>

<style>
:root {
  --brand-color: #04ace5; /* rgb(0, 157, 219); */
  --brand-text-color: white;
  --brand-text-color-dim: rgba(255, 255, 255, 0.75);
  --dark-text-color: dimgray;
  --darker-text-color: rgb(0, 57, 77);

  --background-color: white;
  --background-color-active: white;
  --background-color-dim: #eee;
  --text-color: rgb(0, 57, 77);
  --text-color-active: var(--brand-color);
  --text-color-dim: #444;
}

:root.dark-mode {
  --brand-color: #0080ac;
  --brand-text-color-dim: rgba(255, 255, 255, 0.5);

  --background-color: rgb(24, 31, 35);
  --background-color-active: black;
  --background-color-dim: rgb(40, 47, 51);

  --text-color: rgb(232, 238, 240);
  --text-color-active: var(--text-color);
  --text-color-dim: #bbb;
}

@media (prefers-color-scheme: dark) {
  :root:not(.light-mode) {
    --brand-color: #0080ac;
    --brand-text-color-dim: rgba(255, 255, 255, 0.5);

    --background-color: rgb(24, 31, 35);
    --background-color-active: black;
    --background-color-dim: rgb(40, 47, 51);

    --text-color: rgb(232, 238, 240);
    --text-color-active: var(--text-color);
    --text-color-dim: #bbb;
  }
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
