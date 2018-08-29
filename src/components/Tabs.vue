<template>
  <ul class="tabs">
    <li v-for="tab in tabs" :key="tab.name" :class="['tab', tab.className, { active: currentTab === tab.name }]">
      <a href="#" @click.prevent="tab.onClick(tab.name)">
        <i v-if="tab.icon" :class="['only-mobile', 'fa', tab.icon]"></i>
        <span :class="{ 'only-desktop': tab.icon }">{{ tab.name }}</span>
      </a>
    </li>
  </ul>
</template>
<script>
export default {
  name: "tabs-comp",
  props: {
    tabs: Array,
    onClick: Function,
    currentTab: String
  }
};
</script>
<style>
.tabs {
  flex-grow: 1;
  display: flex;
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
  flex-grow: 1;
  text-align: center;
}
.tab:last-child {
  border-right-width: 0;
}
.tab.active {
  background-color: white;
  color: var(--brand-color);
}
.tab a {
  color: inherit;
  display: block;
  padding: 0.5em 1em;
  text-decoration: none;
}
.tab a:focus {
  outline: none;
}
.tab:not(.active) a:hover,
.tab:not(.active) a:focus {
  color: var(--brand-text-color);
}
.tab-api {
  flex-grow: 0;
}

.only-desktop {
  display: none;
}

@media screen and (min-width: 650px) {
  .only-mobile {
    display: none;
  }
  .tab--desktop {
    display: unset;
  }
  .tab:last-child {
    border-right-width: 1px;
  }
  .only-desktop {
    display: unset;
  }
}
</style>
