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
        label="Hållplats"
        @set-location="setFrom" />
    </div>
    <ul
      v-if="location.id"
      :class="$style.tripsFilter">
      <li>
        <font-awesome
          class="only-mobile"
          icon="filter"/>
        <span class="only-desktop">Filter:</span>
      </li>
      <li>
        <select v-model="filter.dest">
          <option value="">{{ fromToLabel }}</option>
          <option
            v-for="dest in destinations"
            :key="dest"
            :value="dest">{{ dest }}</option>
        </select>
      </li>
      <li>
        <select v-model="filter.track">
          <option value="">Läge</option>
          <option
            v-for="track in tracks"
            :key="track"
            :value="track">{{ track }}</option>
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
          Live
          <input
            v-model="isLive"
            type="checkbox"
            name="live">
        </label>
      </li>
      <li>
        <label :class="$style.voice">
          <font-awesome :icon="['fas', voice ? 'volume-up' : 'volume-off']"/>
          <input
            :class="$style.voiceCheckbox"
            v-model="voice"
            type="checkbox"
            name="voice">
        </label>
      </li>
    </ul>
    <div :class="$style.content">
      <TripsTable
        :is-loading="isLoading"
        :trips="filteredTrips"
        :filter="filter"
        :from="location.name"
        :from-to-label="fromToLabel" />
      <JourneyDetails />
    </div>
    <footer
      v-if="location.name"
      :class="$style.situations">
      <p
        v-for="(msg, index) in info.messages"
        :key="index">{{ msg }}</p>
      <p v-if="info.messages.length === 0">Inga trafikstörningar.</p>
    </footer>
  </section>
</template>
<script>
import { mapState } from 'vuex';

import sortNumbersAndLetters from '../util/sortNumbersAndLetters';
import getDestinationVia from '../util/getDestinationVia';
import { speak } from '../util/speechSynthesis';
import apis from '../api';
import googleDrive from '../api/googleDrive';

import JourneyDetails from './JourneyDetails.vue';
import LocationInput from './LocationInput.vue';
import TripsTable from './TripsTable.vue';

export default {
  name: 'StationInfo',
  components: {
    LocationInput,
    TripsTable,
    JourneyDetails
  },
  props: {
    arrivals: {
      type: Boolean,
      default: false
    }
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
      voice: false,
      timeSpan: '',
      ...savedData
    };
  },
  computed: {
    ...mapState(['locationApi']),
    show() {
      return !!this.trips.length;
    },
    method() {
      return this.arrivals
        ? apis[this.location.region].getArrivalsTo
        : apis[this.location.region].getDeparturesFrom;
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
    filteredTrips() {
      const { track, dest } = this.filter;
      const { affectedLines = [] } = this.info;
      const now = Date.now();
      const filteredManual = this.manualTrips
        .filter(({ origin }) => origin === this.location.name)
        .filter(({ timestamp }) => timestamp > now);

      const filteredTrips = this.trips
        .map((trip) => ({
          ...trip,
          isAffected: affectedLines.includes(trip.sname)
        }))
        .filter((t) => (track ? t.track === track : true))
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
      return apis[this.locationApi].init().then(() => {
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
    setFrom(location) {
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
        }, 30000);
      });
    },
    getDepartures() {
      this.isLoading = true;
      this.method(this.location.id, this.timeSpan)
        .then((resp) => {
          this.trips = resp.map(getDestinationVia);
          console.log('this.trips', this.trips);
          if (this.filteredTrips.length) {
            const { name, direction, timestamp } = this.filteredTrips[0];
            const inMinutes = Math.ceil((timestamp - Date.now()) / (1000 * 60));
            if (this.voice) {
              if (inMinutes <= 0) {
                speak(`${name} mot ${direction}, avgår nu`);
              } else if (inMinutes === 1) {
                speak(`${name} mot ${direction}, avgår om en minut`);
              } else if (inMinutes > 1 && inMinutes <= 60) {
                speak(
                  `${name} mot ${direction}, avgår om ${inMinutes} minuter`
                );
              } else {
                speak(`${name} mot ${direction}, avgår om mer än en timma`);
              }
            }
          }
          this.isLoading = false;
        })
        .catch((reason) => {
          console.warn('reason', reason);
          this.isLoading = false;
        });

      apis[this.location.region]
        .getTrafficSituations(this.location.id, 'stoparea')
        .then((situations) => {
          this.info = situations;
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
.tripsFilter {
  display: flex;
  margin: 0 0 0.5em;
  list-style-type: none;
  padding-left: 0;
}
.tripsFilter li {
  margin-left: 0.5em;
}
.voice {
  cursor: pointer;
}
.voiceCheckbox {
  display: none;
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
