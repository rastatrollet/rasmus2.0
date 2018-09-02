<template>
  <aside :class="[$style.journeyDetails, { [$style.display]: isShowing }]">
    <button
      :class="$style.closeBtn"
      @click.prevent="hide">&cross;</button>
    <h2>Detaljer</h2>
    <div :class="$style.stopList">
      <div
        :class="$style.stop"
        :key="stop.name"
        v-for="stop of selectedJourney">
        <div :class="$style.stopDotCell"><div :class="$style.stopDot"/></div>
        <div :class="$style.stopTime">
          {{ stop.rtDepTime || stop.depTime }}
        </div>
        <div :class="$style.stopName">{{ stop.name }}</div>
        <div :class="$style.stopTrack">{{ stop.track }}</div>
      </div>
    </div>
  </aside>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'JourneyDetails',
  data() {
    return {
      isShowing: false
    };
  },
  computed: {
    ...mapState(['selectedJourney', 'loadingJourneyDetails'])
  },
  watch: {
    selectedJourney(value) {
      if (value) {
        this.isShowing = value;
      }
    }
  },
  methods: {
    hide() {
      this.isShowing = false;
    }
  }
};
</script>
<style module>
.journeyDetails {
  background: white;
  display: none;
  padding: 0.5em;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.display {
  display: block;
}
.closeBtn {
  border: 0;
  border-radius: 0;
  cursor: pointer;
  font-size: 1em;
  padding: 0.5em;
  float: right;
}
.stopList {
}
.stop {
  display: flex;
  align-items: stretch;
  line-height: 2em;
  padding: 0 1em;
}
.stop > div:not(:first-child) {
  border-bottom: 1px solid lightgray;
  padding: 0 0.5em;
}
.stop > div:last-child {
  padding-right: 0;
}

.stopDotCell {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stopDot {
  background: lightblue;
  border-radius: 50%;
  width: 8px;
  height: 8px;
}
.stopDot:before,
.stopDot:after {
  background: lightblue;
  display: block;
  content: '';
  width: 4px;
  height: 1em;
  position: absolute;
  top: 0;
  left: calc(50% - 2px);
}
.stopDot:after {
  top: 50%;
}
.stopTime {
  flex-basis: 60px;
  flex-shrink: 0;
}
.stopName {
  flex-grow: 1;
  text-align: left;
}
.stopTrack {
  text-align: right;
}
</style>
