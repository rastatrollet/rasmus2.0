<template>
  <ul :class="$style.tabs">
    <li
      v-for="tab in tabs"
      :key="tab.name"
      :class="[$style.tab, { [$style.tabSmall]: tab.small, [$style.tabActive]: currentTab === tab.name }]">
      <a
        :class="$style.link"
        :title="tab.name"
        href="#"
        @click.prevent="tab.onClick(tab.name, tab.props.arrivals)">
        <font-awesome
          v-if="tab.icon"
          :icon="tab.icon"
          :class="$style.onlyMobile" />
        <span
          v-if="!tab.initializing"
          :class="{ [$style.onlyDesktop]: tab.icon }">
          {{ tab.name }}
        </span>
        <font-awesome
          v-if="tab.initializing"
          icon="spinner"
          spin/>
      </a>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'TabsComponent',
  props: {
    tabs: {
      type: Array,
      default: () => []
    },
    onClick: {
      type: Function,
      default: () => {}
    },
    currentTab: {
      type: String,
      default: ''
    }
  }
};
</script>
<style module>
.tabs {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.tab {
  background-color: var(--brand-color);
  border-right: 1px solid var(--brand-text-color-dim);
  color: var(--brand-text-color-dim);
  cursor: pointer;
  flex-basis: 53px;
  flex-grow: 1;
  text-align: center;
}

.tab:last-child {
  border-right-width: 0;
}

.tabSmall {
  flex-grow: 0;
}
.tabActive {
  background-color: white;
  color: var(--brand-color);
}
.tabApi {
  flex-grow: 0;
}

.tab:not(.tabActive):hover,
.tab:not(.tabActive):focus {
  color: var(--brand-text-color);
}

.link {
  color: inherit;
  display: block;
  padding: 0.5em 1em;
  text-decoration: none;
}

.link:focus {
  outline: none;
}

.onlyDesktop {
  display: none;
}

@media (min-width: 900px) {
  .onlyMobile {
    display: none;
  }
  .onlyDesktop {
    display: unset;
  }
  .tab:last-child {
    border-right-width: 1px;
  }
}
</style>
