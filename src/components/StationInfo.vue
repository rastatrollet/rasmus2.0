<template>
  <section :class="$style.stationInfo">
    <div :class="$style.form">
      <LocationInput :disabled="initializing" label="Hållplats" />
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
import { mapState, mapGetters, mapActions } from 'vuex';

import MessageCarousel from './MessageCarousel.vue';
import JourneyDetails from './JourneyDetails.vue';
import LocationInput from './LocationInput.vue';
import TripsTable from './TripsTable.vue';

const dict = {
  arrival: {
    arrEaves: 'Ankommer',
    origDest: 'Från'
  },
  departure: {
    arrEaves: 'Avgår',
    origDest: 'Till'
  }
};

export default {
  name: 'StationInfo',
  components: {
    LocationInput,
    JourneyDetails,
    TripsTable,
    MessageCarousel
  },
  props: {
    arrivals: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('trips', ['location', 'situations', 'manualSituations']),
    ...mapState('api', {
      apiName: ({ name }) => name,
      initializing: ({ initializing }) => initializing
    }),
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
    }
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
    }
  },
  beforeDestroy() {
    clearTimeout(this.lastTimeoutId);
  },
  methods: {
    ...mapActions('trips', ['getTrips'])
  }
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

.situations {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
  line-height: 1.4em;
  margin: 0;
}
</style>
