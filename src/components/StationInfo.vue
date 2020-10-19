<template>
  <section :class="$style.stationInfo">
    <div :class="$style.form">
      <LocationInput :disabled="initializing" label="Hållplats" />
    </div>
    <div v-if="showArrDepSelection" :class="$style.arrDep">
      <button
        :class="[$style.arrDepBtn, { [$style.arrDepBtnSelected]: !arrivals }]"
        @click="setArrivals(false)"
      >
        Avgångar
      </button>
      <button
        :class="[$style.arrDepBtn, , { [$style.arrDepBtnSelected]: arrivals }]"
        @click="setArrivals(true)"
      >
        Ankomster
      </button>
    </div>
    <div :class="$style.content">
      <TripsTable :from-to-label="fromToLabel" />
      <JourneyDetails />
      <footer v-if="location" :class="$style.situations">
        <MessageCarousel :messages="mergedSituations" />
      </footer>
    </div>
  </section>
</template>
<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

import MessageCarousel from './MessageCarousel.vue';
import JourneyDetails from './JourneyDetails.vue';
import LocationInput from './LocationInput.vue';
import TripsTable from './TripsTable.vue';

const dict = {
  arrival: {
    name: 'Ankomst',
    arrEaves: 'Ankommer',
    origDest: 'Från',
  },
  departure: {
    name: 'Avgång',
    arrEaves: 'Avgår',
    origDest: 'Till',
  },
};

export default {
  name: 'StationInfo',
  components: {
    LocationInput,
    JourneyDetails,
    TripsTable,
    MessageCarousel,
  },
  computed: {
    ...mapState('trips', ['arrivals', 'location', 'situations', 'manualSituations']),
    ...mapState('api', {
      apiName: ({ name }) => name,
      initializing: ({ initializing }) => initializing,
    }),
    showArrDepSelection() {
      return typeof this.api.getArrivalsTo === 'function';
    },
    mergedSituations() {
      const location = this.location && this.location.name;
      if (!location) return [];

      const now = Date.now();
      const validManualSituations = this.manualSituations
        .filter((situation) => {
          const sameLocation = situation.location === location;
          const isValid = situation.validFrom < now && situation.validUntil > now;
          return sameLocation && isValid;
        })
        .map(({ message }) => message);
      return this.situations.messages.concat(validManualSituations);
    },
    ...mapGetters('api', ['api']),
    dict() {
      return this.arrivals ? dict.arrival : dict.departure;
    },
    show() {
      return !!this.trips.length;
    },
    fromToLabel() {
      return this.arrivals ? 'Från' : 'Till';
    },
    arriveDepartLabel() {
      return this.arrivals ? 'Ankommer' : 'Avgår';
    },
  },
  watch: {
    arrivals(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (this.location) {
          this.getTrips(this.location);
        }
      }
    },
    apiName(newVal, oldVal) {
      if (newVal !== oldVal) {
        clearTimeout(this.lastTimeoutId);
      }
    },
  },
  beforeDestroy() {
    clearTimeout(this.lastTimeoutId);
  },
  methods: {
    ...mapActions('trips', ['getTrips']),
    ...mapMutations('trips', ['setArrivals']),
  },
};
</script>
<style module>
.stationInfo {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.form {
  padding: 0.5em;
}

.content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: scroll;
  position: relative;
}

.arrDep {
  background: var(--background-color-dim);
  border-radius: 5px;
  box-shadow: inset 0px 1px 2px rgba(30, 90, 150, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  justify-content: center;
  align-items: center;
  margin: 0 auto 0.5em;
  padding: 2px 3px;
  text-align: center;
  width: 50%;
}

.arrDepBtn {
  border: none;
  background: transparent;
  border-radius: 4px;
  color: var(--text-color-dim);
  cursor: pointer;
  margin: 0;
  padding: 2px;
}

.arrDepBtn:focus {
  outline: none;
}

.arrDepBtnSelected {
  background: var(--background-color-active);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.13);
  color: var(--text-color);
}

.situations {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
  line-height: 1.4em;
  margin: 0;
}
</style>
