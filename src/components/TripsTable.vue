<template>
  <div :class="[$style.tripsTable, $style[locationApi], { [$style.showingJourneyDetails]: showJourneyDetails }]">
    <table :class="$style.table">
      <thead :class="$style.tableHead">
        <tr>
          <th>{{ metaLabel }}</th>
          <th>Tid</th>
          <th>{{ fromToLabel }}</th>
          <th>Ny tid</th>
          <th>{{ trackLabel }}</th>
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
          <td :class="$style.tripTime">{{ trip.time }}</td>
          <td :class="$style.tripDest">
            <div>
              <span :class="$style.tripName">
                {{ trip.direction || trip.origin }}
              </span>
              <span v-if="trip.isAffected">&nbsp;⛔️</span>
              <span v-if="trip.cancelled">&nbsp;⚠️ Färd inställd</span>
            </div>
            <div :class="$style.tripVia"><small v-if="trip.via"> via {{ trip.via }}</small></div>
          </td>
          <td :class="[$style.tripTime, $style.isLate]"><span v-if="trip.isLate">{{ trip.rtTime }}</span></td>
          <td :class="$style.tripTrack">{{ trip.track }}</td>
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

export default {
  name: 'TripsTable',
  props: {
    fromToLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState(['locationApi', 'showJourneyDetails']),
    ...mapState(['trips', 'isLoading', 'location', 'situations']),
    ...mapGetters({ trips: 'trips/filteredTrips' }),
    ...mapGetters('api', ['dict']),
    metaLabel() {
      return this.dict.sname;
    },
    trackLabel() {
      return this.dict.track;
    }
  },
  methods: {
    ...mapActions(['getJourneyDetails'])
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
  color: rgb(0, 57, 77);
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
.tripTime {
  width: 60px;
}
.isLate {
  color: var(--brand-color);
}
.tripTrack {
  text-align: center;
  width: 50px;
}
</style>
