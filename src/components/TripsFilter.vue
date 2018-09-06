<template>
  <div
    :class="$style.tripsFilter">
    <div :class="$style.filter">
      <font-awesome
        class="only-mobile"
        icon="filter"/>
      <span class="only-desktop">Filter:</span>
    </div>
    <div :class="$style.filter">
      <select v-model="filter.dest">
        <option value="">{{ fromToLabel }}</option>
        <option
          v-for="dest in destinations"
          :key="dest"
          :value="dest">{{ dest }}</option>
      </select>
    </div>
    <div :class="$style.filter">
      <select v-model="filter.track">
        <option value="">Läge</option>
        <option
          v-for="track in tracks"
          :key="track"
          :value="track">{{ track }}</option>
      </select>
    </div>
    <div :class="$style.filter">
      <select v-model="filter.timeSpan">
        <option value="">{{ arriveDepartLabel }} inom</option>
        <option value="30">30 min</option>
        <option value="60">1 timme</option>
        <option value="120">2 timmar</option>
        <option value="180">3 timmar</option>
        <option value="360">6 timmar</option>
        <option value="720">12 timmar</option>
        <option value="1440">24 timmar</option>
      </select>
    </div>
    <div :class="[$style.filter, 'only-desktop']">
      <label>
        Live
        <input
          v-model="options.isLive"
          type="checkbox"
          name="live">
      </label>
    </div>
    <div :class="$style.filter">
      <label :class="$style.voice">
        <font-awesome :icon="['fas', options.voice ? 'volume-up' : 'volume-off']"/>
        <input
          :class="$style.voiceCheckbox"
          v-model="options.voice"
          type="checkbox"
          name="voice">
      </label>
    </div>
  </div>
</template>
<script>
import { mapState, mapGetters, mapMutations } from 'vuex';

export default {
  name: 'TripsFilter',
  props: {
    dict: Object
  },
  computed: {
    ...mapState('trips', ['filter', 'options']),
    ...mapGetters('trips', ['destinations', 'tracks']),
    fromToLabel() {
      return this.dict.origDest;
    },
    arriveDepartLabel() {
      return this.dict.arrEaves;
    }
  },
  methods: {
    ...mapMutations('trips', ['setFilter'])
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
</style>
