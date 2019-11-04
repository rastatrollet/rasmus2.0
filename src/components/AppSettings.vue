<template>
  <div :class="[$style.container, className]">
    <h2>Inställningar</h2>

    <p>API</p>
    <div :class="$style.apis">
      <button
        @click="toggleApi(api)"
        v-for="api in apis"
        :key="api"
        :class="[$style.apiBtn, api === apiName && $style.apiBtnActive]"
      >
        {{ getLongName(api) }}
        <font-awesome v-if="api === apiName && initializing" icon="spinner" spin />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import apis from '../api';

export default {
  name: 'AppSettings',
  props: {
    className: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      apis: Object.keys(apis)
    };
  },
  computed: {
    ...mapState('api', {
      apiName: ({ name }) => name,
      initializing: ({ initializing }) => initializing
    })
  },
  methods: {
    ...mapActions('api', ['toggleApi']),
    getLongName(api) {
      switch (api) {
        case 'TV':
          return 'TrafikVerket';
        case 'VT':
          return 'VästTrafik';
        default:
          return api;
      }
    }
  }
};
</script>

<style module>
.container {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
  height: 100%;
  padding: 1em;
}

.apis {
  display: flex;
  justify-content: space-between;
}

.apiBtn {
  background: transparent;
  border: 1px solid var(--brand-text-color);
  color: var(--brand-text-color);
  flex: 1;
  display: flex;
  font-size: 1em;
  padding: 0.5em;
  justify-content: center;
}
.apiBtnActive {
  background: var(--brand-text-color);
  color: var(--brand-color);
}
.apiBtn:focus {
  outline: none;
}
</style>
