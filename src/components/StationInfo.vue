<template>
  <div class="station-info">
    <div class="station-info__form">
      <p v-if="!initialized">
        Initierar... <i class="fa fa-spin fa-spinner"></i>
      </p>
      <LocationInput :location="location" :location-api="locationApi" displayNearbyStops label="Hållplats" :parentLoading="isLoading" :disabled="!initialized" @set-location="setFrom" />
    </div>
    <ul class="station-info__trips-filter" v-if="location.id">
      <li>
        <i class="only-mobile fa fa-filter"></i>
        <span class="only-desktop">Filter:</span>
      </li>
      <li>
        <select v-model="filter.dest">
          <option value="">{{ fromToLabel }}</option>
          <option v-for="dest in destinations" :key="dest" :value="dest">{{ dest }}</option>
        </select>
      </li>
      <li>
        <select v-model="filter.track">
          <option value="">Läge</option>
          <option v-for="track in tracks" :key="track" :value="track">{{ track }}</option>
        </select>
      </li>
      <li>
        <select v-model="timeSpan">
          <option value="">{{ arriveDepartLabel }} inom</option>
          <option value="30">30 min</option>
          <option value="60">1 timme</option>
          <option value="120">2 timmar</option>
          <option value="180">3 timmar</option>
          <option value="360">6 timmar</option>
          <option value="720">12 timmar</option>
          <option value="1440">24 timmar</option>
        </select>
      </li>
      <li class="only-desktop">
        <label>
          Live update
          <input type="checkbox" name="live" v-model="isLive">
        </label>
      </li>
    </ul>
    <TripsTable :isLoading="isLoading" :trips="filteredTrips" :filter="filter" :from="location.name" :location-api="locationApi" :from-to-label="fromToLabel" />
    <div class="station-info__situations" v-if="location.name">
      <p v-for="(msg, index) in info.messages" :key="index">{{ msg }}</p>
      <p v-if="info.messages.length === 0">Inga trafikstörningar.</p>
    </div>
  </div>
</template>
<script>
import sortNumbersAndLetters from '../util/sortNumbersAndLetters';
import getDestinationVia from '../util/getDestinationVia';
import LocationInput from './LocationInput.vue';
import TripsTable from './TripsTable.vue';
import apis from '../api';
import googleDrive from '../api/googleDrive';

export default {
  name: 'station-info',
  components: {
    LocationInput,
    TripsTable
  },
  props: {
    arrivals: Boolean,
    locationApi: String
  },
  data() {
    // eslint-disable-next-line
    const savedData = JSON.parse(window[this.$options._componentTag] || '{}');
    return {
      location: {},
      isLoading: false,
      initialized: [],
      trips: [],
      manualTrips: [],
      info: {
        messages: []
      },
      filter: {
        track: '',
        dest: ''
      },
      isLive: true,
      timeSpan: '',
      ...savedData
    };
  },
  computed: {
    show() {
      return !!this.trips.length;
    },
    method() {
      return this.arrivals
        ? apis[this.location.region].getArrivalsTo
        : apis[this.location.region].getDeparturesFrom;
    },
    tracks() {
      const tracks = [].concat(this.trips).map(({ track }) => track);
      return Array.from(new Set(tracks)).sort(sortNumbersAndLetters);
    },
    destinations() {
      const destinations = []
        .concat(this.trips)
        .map(({ direction, origin }) => direction || origin);
      return Array.from(new Set(destinations));
    },
    filteredTrips() {
      const { track, dest } = this.filter;
      const { affectedLines = [] } = this.info;
      const now = Date.now();
      const filteredManual = this.manualTrips
        .filter(({ origin }) => origin === this.location.name)
        .filter(({ timestamp }) => timestamp > now);

      const filteredTrips = this.trips
        .map(trip => ({
          ...trip,
          isAffected: affectedLines.includes(trip.sname)
        }))
        .filter(t => (track ? t.track === track : true))
        .filter(
          ({ direction, origin }) =>
            dest ? direction === dest || origin === dest : true
        );

      return [...filteredManual, ...filteredTrips].sort(
        (a, b) => a.timestamp - b.timestamp
      );
    },
    fromToLabel() {
      return this.arrivals ? 'Från' : 'Till';
    },
    arriveDepartLabel() {
      return this.arrivals ? 'Ankommer' : 'Avgår';
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
  watch: {
    arrivals(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.trips = [];
        this.info = { messages: [] };
        if (this.location.region) {
          this.getDepartures();
        }
      }
    },
    isLive(value) {
      console.log('isLive', value);
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
  methods: {
    init() {
      if (this.initialized.includes(this.locationApi)) {
        return Promise.resolve();
      }
      return apis[this.locationApi].init().then(() => {
        this.initialized.push(this.locationApi);
      });
    },
    loadManualDepartures() {
      if (this.locationApi === 'VT') {
        googleDrive.getManualDepartures().then(res => {
          this.manualTrips = apis.VT.transformTrips(res);
          console.log('this.manualTrips', this.manualTrips);
        });
      }
    },
    setFrom(location) {
      console.log('set location', location);
      this.location = location || {};
      this.getDepartures();
      this.refreshDepartures();
    },
    refreshDepartures() {
      clearTimeout(this.lastTimeoutId);
      window.requestAnimationFrame(() => {
        this.lastTimeoutId = setTimeout(() => {
          this.getDepartures();
          this.refreshDepartures();
        }, 20000);
      });
    },
    getDepartures() {
      this.isLoading = true;
      this.method(this.location.id, this.timeSpan)
        .then(resp => {
          this.trips = resp.map(getDestinationVia);
          console.log('this.trips', this.trips);
          this.isLoading = false;
        })
        .catch(reason => {
          console.warn('reason', reason);
          this.isLoading = false;
        });
      apis[this.location.region]
        .getTrafficSituations(this.location.id, 'stoparea')
        .then(situations => {
          this.info = situations;
        });
    }
  }
};
</script>
<style>
.station-info {
}
.station-info__form {
  padding: 0.5em;
}
.station-info__trips-filter {
  display: flex;
  margin: 0 0 0.5em;
  list-style-type: none;
  padding-left: 0;
}
.station-info__trips-filter li {
  margin-left: 0.5em;
}
.station-info__situations {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
  line-height: 1.4em;
  margin: 0;
  padding: 1em 1.5em;
}
</style>
