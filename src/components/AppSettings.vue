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
    <p>
      <label>
        Hämta resor inom:
        <select name="timeSpan" :class="$style.timeSpan" @change="updateFilter">
          <option
            v-for="span in timeSpans"
            :key="span.value"
            :selected="span.value === filter.timeSpan"
            :value="span.value"
          >
            {{ span.name }}
          </option>
        </select>
      </label>
    </p>
    <p>
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
    </p>

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
      default: () => [],
    },
  },
  data() {
    return {
      buildTime: process.env.BUILD_TIME,
      apis: Object.keys(apis),
      timeSpans: [
        { value: '', name: 'API default' },
        { value: '30', name: '30 min' },
        { value: '60', name: '1 timme' },
        { value: '120', name: '2 timmar' },
        { value: '180', name: '3 timmar' },
        { value: '360', name: '6 timmar' },
        { value: '720', name: '12 timmar' },
        { value: '1440', name: '24 timmar' },
      ],
    };
  },
  computed: {
    ...mapState('trips', ['filter', 'options']),
    ...mapState('api', {
      apiName: ({ name }) => name,
      initializing: ({ initializing }) => initializing,
    }),
  },
  methods: {
    ...mapActions('api', ['toggleApi']),
    ...mapMutations('trips', ['setOptions', 'setFilter']),
    updateFilter({ target }) {
      const { name, value } = target;
      if (!name) return;
      this.setFilter({ [name]: value });
    },
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
    },
  },
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

.timeSpan {
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  background-color: transparent;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat, repeat;
  background-position: right 0.7em top 50%, 0 0;
  background-size: 0.65em auto, 100%;
  border: 1px solid var(--brand-text-color-dim);
  border-radius: 0;
  box-shadow: none;
  color: var(--brand-text-color);
  display: block;
  font-size: 1em;
  font-family: inherit;
  padding: 0.6em 1.4em 0.5em 0.8em;
  position: relative;
  width: 100%;
  max-width: 100%;
}
.timeSpan:after {
  background: white;
  display: block;
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
}

.voiceCheckbox {
  display: none;
}
</style>
