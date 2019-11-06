<template>
  <div :class="[$style.container, className]">
    <h2>Inställningar</h2>

    <p :class="$style.label">API</p>
    <div :class="$style.apis">
      <button
        v-for="api in apis"
        :key="api"
        :class="[$style.apiBtn, api === apiName && $style.apiBtnActive]"
        @click="toggleApi(api)"
      >
        {{ getLongName(api) }}
        <font-awesome v-if="api === apiName && initializing" icon="spinner" spin />
      </button>
    </div>

    <p :class="$style.label">Other</p>
    <div>
      <label :class="$style.voice">
        Uppläsning: {{ options.voice ? 'På' : 'Av' }}
        <font-awesome :icon="['fas', options.voice ? 'volume-up' : 'volume-off']" />
        <input
          :class="$style.voiceCheckbox"
          :checked="options.voice"
          name="voice"
          type="checkbox"
          @input="updateOption"
        />
      </label>
    </div>

    <p :class="$style.label">Build info</p>
    <div>
      <p>{{ buildTime }}</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';

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
      buildTime: process.env.BUILD_TIME,
      apis: Object.keys(apis)
    };
  },
  computed: {
    ...mapState('trips', ['options']),
    ...mapState('api', {
      apiName: ({ name }) => name,
      initializing: ({ initializing }) => initializing
    })
  },
  methods: {
    ...mapActions('api', ['toggleApi']),
    ...mapMutations('trips', ['setOptions']),
    updateOption({ target }) {
      const { name, checked } = target;
      if (!name) return;
      this.setOptions({ [name]: checked });
    },
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

.label {
  color: rgba(255, 255, 255, 0.75);
  margin-top: 1.5em;
  text-transform: uppercase;
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

.voiceCheckbox {
  display: none;
}
</style>
