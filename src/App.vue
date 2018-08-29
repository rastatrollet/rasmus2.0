<template>
  <div id="app">
    <div class="top-nav">
      <Tabs :tabs="tabs" :onClick="changeTab" :currentTab="currentTab" />
      <DigitalClock />
    </div>
    <div class="container">
      <component :is="currentTabComponent.componentName" v-bind="currentTabComponent.props" :location-api="locationApi"></component>
    </div>
  </div>
</template>

<script>
import DigitalClock from "./components/DigitalClock.vue";
import StationInfo from "./components/StationInfo.vue";
import Tabs from "./components/Tabs.vue";

const locationAPIs = ["VT", "TV"];
const baseTab = {
  icon: "",
  className: "",
  props: {},
  onClick() {}
};
const components = [
  {
    name: "Avgångar",
    componentName: "station-info"
  },
  {
    name: "Ankomster",
    componentName: "station-info",
    props: { arrivals: true }
  },
  {
    name: "Karta",
    componentName: "map-component",
    icon: "fa-map"
  },
  {
    name: "Info",
    componentName: "information-page",
    icon: "fa-info-circle"
  }
];

export default {
  name: "app",
  components: {
    Tabs,
    DigitalClock,
    StationInfo
  },
  data() {
    return {
      currentTab: "Avgångar",
      locationApi: locationAPIs[0]
    };
  },
  computed: {
    tabs() {
      return [
        {
          ...baseTab,
          name: this.locationApi,
          className: "tab-api",
          onClick: this.toggleApi
        },
        ...components.map(comp => ({
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
    toggleApi() {
      this.locationApi = locationAPIs.find(api => api !== this.locationApi);
    }
  }
};
</script>
<style>
:root {
  --brand-color: rgb(0, 157, 219);
  --brand-text-color: white;
  --brand-text-color-dim: rgba(255, 255, 255, 0.5);
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
</style>
