<template>
  <div
    :class="[
      $style.tripsTable,
      {
        [$style.VT]: apiName === 'VT',
        [$style.TV]: apiName === 'TV',
        [$style.SL]: apiName === 'SL',
        [$style.showingJourneyDetails]: showJourneyDetails
      }
    ]"
  >
    <table :class="$style.table">
      <thead :class="$style.tableHead">
        <tr>
          <th>{{ metaLabel }}</th>
          <th>{{ fromToLabel }}</th>
          <th>Tid</th>
          <th :class="$style.tripNewTime">Ny tid</th>
          <th>{{ trackLabel }}</th>
          <th v-if="hasNotes">Anm</th>
        </tr>
      </thead>
      <tbody :class="$style.tableBody">
        <tr
          v-for="trip in trips"
          :key="trip.id"
          :class="[$style.trip]"
          @click="getJourneyDetails(trip)"
        >
          <td
            :style="{ backgroundColor: trip.fgColor, color: trip.bgColor }"
            :class="$style.tripLine"
          >
            {{ trip.sname }}
          </td>
          <td :class="$style.tripDest">
            <div>
              <span :class="$style.tripName">{{ trip.direction || trip.origin }}</span>
            </div>
            <div :class="$style.tripVia">
              <small v-if="trip.via">via {{ trip.via | unbreakMySpace }}</small>
            </div>
          </td>
          <td :class="$style.tripTime">
            <span :class="['only-mobile', { [$style.isLate]: trip.isLate }]">
              {{ (trip.rtTime || trip.time) | humanTime }}
            </span>
            <span class="from-tablet">{{ trip.time | humanTime }}</span>
          </td>
          <td :class="[$style.tripNewTime, $style.isLate]">
            <span v-if="trip.isLate">{{ trip.rtTime | humanTime }}</span>
          </td>
          <td :class="$style.tripTrack">{{ trip.rtTrack || trip.track }}</td>
          <td v-if="hasNotes" :class="$style.tripNote">
            <span v-if="trip.cancelled">Inställd</span>
            <span v-if="trip.remark">{{ trip.remark }}</span>
          </td>
        </tr>
        <tr v-show="!isLoading && location && trips.length === 0">
          <td colspan="5">Inga resor att visa</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import RelativeTimeFormat from 'relative-time-format';
import swedish from 'relative-time-format/locale/sv.json';
import { mapState, mapGetters, mapActions } from 'vuex';

import debounce from '../util/debounce';
import { speak } from '../util/speechSynthesis';

RelativeTimeFormat.addLocale(swedish);

const nbsp = ' '; // no breaking space
const timeFormatter = new RelativeTimeFormat('sv', { style: 'narrow' });

const minutesFromNow = (timeStr) => {
  const [hours, minutes] = String(timeStr).split(':');
  const now = Date.now();
  const then = new Date();

  then.setHours(hours);
  then.setMinutes(minutes);

  const minDiff = (then - now) / 1000 / 60;

  // if it's 20 minutes past, assume its tomorrow
  if (minDiff < -20) {
    return minDiff + 60 * 24;
  }
  return minDiff;
};

export default {
  name: 'TripsTable',
  filters: {
    humanTime(value) {
      const minutes = minutesFromNow(value);
      if (minutes > 20) return value;
      if (minutes < 1) return 'Nu';
      return timeFormatter
        .format(minutes, 'minute')
        .slice(1) // get rid of leading +/-
        .replace(' ', nbsp);
    },
    unbreakMySpace(value) {
      if (!value.includes(' ')) return value;
      return value.replace(' ', nbsp);
    }
  },
  props: {
    fromToLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    hasNotes() {
      return this.trips.some(({ cancelled, remark }) => Boolean(cancelled || remark));
    },
    ...mapState({
      showJourneyDetails: (state) => state.showJourneyDetails,
      apiName: ({ api }) => api.name
    }),
    ...mapState('trips', {
      isLoading: ({ isLoading }) => isLoading,
      location: ({ location }) => location,
      doSpeak: ({ options }) => options.voice
    }),
    ...mapGetters({ trips: 'trips/filteredTrips' }),
    ...mapGetters('api', ['dict']),
    metaLabel() {
      return this.dict.sname;
    },
    trackLabel() {
      return this.dict.track;
    }
  },
  watch: {
    trips(trips) {
      if (!trips || trips.length === 0) return;
      this.speak(trips);
    }
  },
  mounted() {
    this.speak = debounce(this.speak, 250, this);
  },
  methods: {
    ...mapActions(['getJourneyDetails']),
    speak(trips) {
      if (trips.length < 1 || !this.doSpeak) return;
      const { name, direction, timestamp, cancelled } = trips[0];
      const via = (trips[0].via && `via ${trips[0].via},`) || '';
      const inMinutes = Math.ceil((timestamp - Date.now()) / (1000 * 60));
      if (cancelled) {
        speak(`${name} mot ${direction}, ${via} är inställd`);
      } else if (inMinutes <= 0) {
        speak(`${name} mot ${direction}, ${via} avgår nu`);
      } else if (inMinutes === 1) {
        speak(`${name} mot ${direction}, ${via} avgår om en minut`);
      } else if (inMinutes > 1 && inMinutes <= 60) {
        speak(`${name} mot ${direction}, ${via} avgår om ${inMinutes} minuter`);
      } else {
        speak(`${name} mot ${direction}, ${via} avgår om mer än en timma`);
      }
    }
  }
};
</script>

<style module>
.tripsTable {
  flex: 1;
  width: 100%;
}

.showingJourneyDetails {
  display: none;
}
@media (min-width: 900px) {
  .showingJourneyDetails {
    display: block;
  }
}

.table {
  background-color: white;
  border: 0;
  border-collapse: collapse;
  color: var(--darker-text-color);
  width: 100%;
}

.table td,
.table th {
  padding: 0.5em;
}

.tableHead {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
}
.tableHead th {
  font-weight: normal;
  text-align: left;
}

.trip {
  cursor: pointer;
}
.trip:nth-child(even) {
  background: #eee;
}

.tripLine {
  padding: 0.5em;
  text-align: center;
  width: 50px;
}

.tripName {
  font-weight: 500;
}
.tripTime,
.tripNewTime {
  width: 60px;
}
.tripNewTime {
  display: none;
}
.isLate {
  color: var(--brand-color);
}
.tripTrack {
  text-align: center;
  width: 50px;
}
.tripNote {
  width: 1%;
}

@media screen and (min-width: 450px) {
  .tripNewTime {
    display: table-cell;
  }
}

/***
 * API-BASED THEMES
 */
.VT {
}

.TV .tripLine {
  text-align: left;
}

.SL {
}
</style>
