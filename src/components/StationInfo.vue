<template>
  <section :class="$style.stationInfo">
    <div :class="$style.form">
      <LocationInput
        :disabled="initializing"
        label="Hållplats" />
    </div>
    <TripsFilter
      :dict="dict"
      v-if="location"/>
    <div :class="$style.content">
      <TripsTable
        :from-to-label="fromToLabel" />
      <JourneyDetails />
    </div>
    <footer
      v-if="location"
      :class="$style.situations">
      <MessageCarousel :messages="situations.messages" />
    </footer>
  </section>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex';

import apis from '../api';
import googleDrive from '../api/googleDrive';

import MessageCarousel from './MessageCarousel.vue';
import JourneyDetails from './JourneyDetails.vue';
import LocationInput from './LocationInput.vue';
import TripsTable from './TripsTable.vue';
import TripsFilter from './TripsFilter.vue';

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
    TripsFilter,
    MessageCarousel
  },
  props: {
    arrivals: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      manualTrips: []
    };
  },
  computed: {
    ...mapState('trips', ['location', 'situations']),
    ...mapState('api', {
      apiName: ({ name }) => name,
      initializing: ({ initializing }) => initializing
    }),
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
        this.loadManualDepartures();
      }
    }
  },
  mounted() {
    this.loadManualDepartures();
  },
  beforeDestroy() {
    clearTimeout(this.lastTimeoutId);
  },
  methods: {
    ...mapActions('trips', ['getTrips']),
    // TODO: move this somewhere else
    loadManualDepartures() {
      if (this.apiName === 'SOMETHING THAT DOES NOT EXIST') {
        googleDrive.getManualDepartures().then((res) => {
          this.manualTrips = apis.VT.transformTrips(res);
          console.log('this.manualTrips', this.manualTrips);
        });
      }
    }
  }
};
</script>
<style module>
.stationInfo {
}

.form {
  padding: 0.5em;
}

.content {
  display: flex;
  position: relative;
}

.situations {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
  line-height: 1.4em;
  margin: 0;
  padding: 1em 1.5em;
}
</style>
