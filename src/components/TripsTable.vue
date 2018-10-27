<template>
  <div
    :class="[$style.tripsTable, {
      [$style.VT]: apiName === 'VT',
      [$style.TV]: apiName === 'TV',
      [$style.SL]: apiName === 'SL',
      [$style.showingJourneyDetails]: showJourneyDetails
  }]">
    <table :class="$style.table">
      <thead :class="$style.tableHead">
        <tr>
          <th>{{ metaLabel }}</th>
          <th>{{ fromToLabel }}</th>
          <th>Tid</th>
          <th :class="$style.tripNewTime">Ny tid</th>
          <th>{{ trackLabel }}</th>
          <th>Anm</th>
        </tr>
      </thead>
      <tbody :class="$style.tableBody">
        <tr v-show="isLoading">
          <td colspan="5">
            Hämtar trafikdata...
            <font-awesome
              icon="spinner"
              spin />
          </td>
        </tr>
        <tr
          v-for="trip in trips"
          :key="trip.id"
          :class="[$style.trip, { [$style.cancelled]: trip.cancelled }]"
          @click="getJourneyDetails(trip)">
          <td
            :style="{ backgroundColor: trip.fgColor, color: trip.bgColor }"
            :class="$style.tripLine">
            {{ trip.sname }}
          </td>
          <td :class="$style.tripDest">
            <div>
              <span :class="$style.tripName">
                {{ trip.direction || trip.origin }}
              </span>
            </div>
            <div :class="$style.tripVia"><small v-if="trip.via"> via {{ trip.via }}</small></div>
          </td>
          <td :class="$style.tripTime">
            <span :class="['only-mobile', { [$style.isLate]: trip.isLate }]">{{ trip.rtTime || trip.time }}</span>
            <span class="from-tablet">{{ trip.time }}</span>
          </td>
          <td :class="[$style.tripNewTime, $style.isLate]"><span v-if="trip.isLate">{{ trip.rtTime }}</span></td>
          <td :class="$style.tripTrack">{{ trip.track }}</td>
          <td :class="$style.tripNote">
            <span v-if="trip.isAffected">&nbsp;⛔️</span>
            <span v-if="trip.cancelled">&nbsp;⚠️ Färd inställd</span>
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
import { mapState, mapGetters, mapActions } from 'vuex';
import debounce from '../util/debounce';
import { speak } from '../util/speechSynthesis';

export default {
  name: 'TripsTable',
  props: {
    fromToLabel: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.speak = debounce(this.speak, 250, this);
  },
  computed: {
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
      this.speak(trips);
    }
  },
  methods: {
    ...mapActions(['getJourneyDetails']),
    speak(trips) {
      if (trips.length < 1 || !this.doSpeak) return;
      const { name, direction, timestamp } = trips[0];
      const via = (trips[0].via && `via ${trips[0].via},`) || '';
      const inMinutes = Math.ceil((timestamp - Date.now()) / (1000 * 60));
      if (inMinutes <= 0) {
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

.cancelled .tripName {
  text-decoration: line-through;
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
