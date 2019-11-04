<template>
  <div :class="$style.tripsFilter">
    <div :class="$style.filter">
      <font-awesome class="only-mobile" icon="filter" />
      <span class="from-tablet">Filter:</span>
    </div>
    <div :class="$style.filter">
      <select @change="updateFilter" name="dest">
        <option value="">{{ fromToLabel }}</option>
        <option
          v-for="dest in destinations"
          :selected="filter.dest === dest"
          :key="dest"
          :value="dest"
          >{{ dest }}</option
        >
      </select>
    </div>
    <div :class="$style.filter">
      <select @change="updateFilter" name="track">
        <option value="">Läge</option>
        <option
          v-for="track in tracks"
          :selected="filter.track === track"
          :key="track"
          :value="track"
          >{{ track }}</option
        >
      </select>
    </div>
    <!-- <div :class="$style.filter">
      <select
        @change="updateFilter"
        name="timeSpan">
        <option value="">{{ arriveDepartLabel }} inom</option>
        <option
          v-for="span in timeSpans"
          :selected="span.value === filter.timeSpan"
          :key="span.value"
          :value="span.value">{{ span.name }}</option>
      </select>
    </div> -->
    <!-- <div :class="[$style.filter, 'from-desktop']">
      <label>
        Live
        <input
          :checked="options.isLive"
          @input="updateOption"
          type="checkbox"
          name="isLive">
      </label>
    </div> -->
    <div :class="$style.filter">
      <label :class="$style.voice">
        <font-awesome :icon="['fas', options.voice ? 'volume-up' : 'volume-off']" />
        <input
          :class="$style.voiceCheckbox"
          :checked="options.voice"
          @input="updateOption"
          type="checkbox"
          name="voice"
        />
      </label>
    </div>
    <div :class="$style.filter">
      <button :class="$style.refreshBtn" @click.prevent="getTrips()" title="Uppdatera">
        <font-awesome icon="sync" />
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import sortNumbersAndLetters from '../util/sortNumbersAndLetters';
import getFormData from '../util/getFormData';

export default {
  name: 'TripsFilter',
  props: {
    dict: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      radio: false,
      timeSpans: [
        { value: '30', name: '30 min' },
        { value: '60', name: '1 timme' },
        { value: '120', name: '2 timmar' },
        { value: '180', name: '3 timmar' },
        { value: '360', name: '6 timmar' },
        { value: '720', name: '12 timmar' },
        { value: '1440', name: '24 timmar' }
      ]
    };
  },
  computed: {
    ...mapState('trips', ['filter', 'options']),
    ...mapGetters({ trips: 'trips/filteredTrips' }),
    fromToLabel() {
      return this.dict.origDest;
    },
    arriveDepartLabel() {
      return this.dict.arrEaves;
    },
    destinations() {
      return Array.from(new Set(this.trips.map(({ direction, origin }) => direction || origin)));
    },
    tracks() {
      const tracks = this.trips
        .map(({ track }) => track)
        .filter((x) => x)
        .map(String);

      return Array.from(new Set(tracks)).sort(sortNumbersAndLetters);
    }
  },
  methods: {
    ...mapMutations('trips', ['setFilter', 'setOptions']),
    ...mapActions('trips', ['getTrips']),
    updateFilter({ target }) {
      const filter = getFormData(target);
      if (!filter) return;
      this.setFilter(filter);
    },
    updateOption({ target }) {
      const option = getFormData(target);
      if (!option) return;
      this.setOptions(option);
    }
  }
};
</script>

<style module>
.tripsFilter {
  display: flex;
  align-items: center;
  padding: 0.5em;
}
.filter:not(:first-child) {
  margin-left: 0.5em;
}
.voice {
  cursor: pointer;
}
.voiceCheckbox {
  display: none;
}
.refreshBtn {
  background: transparent;
  border: 0;
  color: currentColor;
  cursor: pointer;
  font-size: 1em;
}
.refreshBtn:focus {
  outline: none;
}
</style>
