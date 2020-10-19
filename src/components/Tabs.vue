<template>
  <ul :class="$style.tabs">
    <li
      v-for="tab in tabs"
      :key="tab.name"
      :class="[
        $style.tab,
        tab.className,
        {
          [$style.tabSmall]: tab.small,
          [$style.tabActive]: showSettings ? tab.name === 'Inställningar' : currentTab === tab.name,
          [$style.tabDisabled]: tab.disabled,
        },
      ]"
    >
      <a :class="$style.link" :title="tab.name" href="#" @click.prevent="tab.onClick(tab)">
        <font-awesome v-if="tab.icon" :icon="tab.icon" :class="$style.icon" />
        <span v-if="!tab.onlyIcon" :class="[$style.text]">{{ tab.name }}</span>
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
      default: () => [],
    },
    currentTab: {
      type: String,
      default: '',
    },
    showSettings: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
<style module>
.tabs {
  border-top: 1px solid var(--background-color);
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.tab {
  align-self: stretch;
  background-color: var(--brand-color);
  border-right: 1px solid var(--brand-text-color-dim);
  color: var(--brand-text-color);
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
  background-color: var(--background-color-active);
  color: var(--text-color-active);
}
.tabApi {
  flex-grow: 0;
}
.tabDisabled {
  text-decoration: line-through;
  pointer-events: none;
  color: var(--brand-text-color-dim);
  cursor: disabled;
}

.tab:not(.tabActive):hover,
.tab:not(.tabActive):focus {
  color: var(--brand-text-color);
}

.link {
  color: inherit;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0.5em 1em 1em;
  text-decoration: none;
}

.link:focus {
  outline: none;
}

.text {
  font-size: 0.7em;
}

.icon {
  margin-bottom: 0.2em;
}

@supports (-webkit-overflow-scrolling: touch) {
  .link {
    padding-bottom: max(1em, env(safe-area-inset-bottom));
  }
  .link:first-child {
    padding-left: max(1em, env(safe-area-inset-left));
  }
  .link:last-child {
    padding-right: max(1em, env(safe-area-inset-right));
  }
}

@media (min-width: 576px) {
  .link {
    flex-direction: row;
  }
  .text {
    font-size: 1em;
  }
  .icon {
    margin-bottom: 0;
    margin-right: 1vw;
  }
}
</style>
