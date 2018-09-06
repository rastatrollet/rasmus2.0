<template>
  <section :class="$style.stationInfo">
    <div :class="$style.form">
      <p v-if="!initialized">
        Initierar... <font-awesome
          icon="spinner"
          spin/>
      </p>
      <LocationInput
        :disabled="!initialized"
        label="Hållplats" />
    </div>
    <TripsFilter :dict="dict" v-if="location"/>
    <div :class="$style.content">
      <TripsTable
        :from-to-label="fromToLabel" />
      <JourneyDetails />
    </div>
    <footer
      v-if="location"
      :class="$style.situations">
      <p
        v-for="(msg, index) in situations"
        :key="index">{{ msg }}</p>
      <p v-if="situations.length === 0">Inga trafikstörningar.</p>
    </footer>
  </section>
</template>
<script>
import { mapState, mapGetters } from 'vuex';

import sortNumbersAndLetters from '../util/sortNumbersAndLetters';
import apis from '../api';
import googleDrive from '../api/googleDrive';

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
    TripsFilter
  },
  props: {
    arrivals: {
      type: Boolean,
      default: false
    }
  },
  data() {
    // eslint-disable-next-line
    // const savedData = JSON.parse(window[this.$options._componentTag] || '{}');
    return {
      initialized: [],
      manualTrips: [],
    };
  },
  computed: {
    ...mapState(['locationApi']),
    ...mapState('trips', ['location', 'situations']),
    ...mapGetters('api', ['api']),
    dict() {
      return this.arrivals ? dict.arrival : dict.departure;
    },
    show() {
      return !!this.trips.length;
    },
    method() {
      return this.arrivals
        ? this.api.getArrivalsTo
        : this.api.getDeparturesFrom;
    },
    tracks() {
      const tracks = []
        .concat(this.trips)
        .map(({ track }) => track)
        .map(String)
        .filter((x) => x);

      return Array.from(new Set(tracks)).sort(sortNumbersAndLetters);
    },
    destinations() {
      const destinations = []
        .concat(this.trips)
        .map(({ direction, origin }) => direction || origin);
      return Array.from(new Set(destinations));
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
        this.trips = [];
        this.info = { messages: [] };
        if (this.location) {
          this.getDepartures();
        }
      }
    },
    isLive(value) {
      if (value) {
        this.refreshDepartures();
      } else {
        clearTimeout(this.lastTimeoutId);
      }
    },
    timeSpan() {
      this.getDepartures();
    },
    locationApi(newVal, oldVal) {
      if (newVal !== oldVal) {
        clearTimeout(this.lastTimeoutId);
        this.trips = [];
        this.filter = {
          track: '',
          dest: ''
        };
        this.init().then(() => this.loadManualDepartures());
      }
    }
  },
  mounted() {
    this.init().then(() => this.loadManualDepartures());
  },
  beforeDestroy() {
    // eslint-disable-next-line
    window[this.$options._componentTag] = JSON.stringify(this._data);
    clearTimeout(this.lastTimeoutId);
  },
  methods: {
    init() {
      if (this.initialized.includes(this.locationApi)) {
        return Promise.resolve();
      }
      return this.api.init().then(() => {
        this.initialized.push(this.locationApi);
      });
    },
    loadManualDepartures() {
      if (this.locationApi === 'VT') {
        googleDrive.getManualDepartures().then((res) => {
          this.manualTrips = apis.VT.transformTrips(res);
          console.log('this.manualTrips', this.manualTrips);
        });
      }
    },
    refreshDepartures() {
      clearTimeout(this.lastTimeoutId);
      window.requestAnimationFrame(() => {
        this.lastTimeoutId = setTimeout(() => {
          this.getDepartures();
          this.refreshDepartures();
        }, 30000);
      });
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
