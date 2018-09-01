<template>
  <div :class="['trips-table', `trips-table--${locationApi}`]">
    <table>
      <thead>
        <tr>
          <th>{{ metaLabel }}</th>
          <th>Tid</th>
          <th>{{ fromToLabel }}</th>
          <th>Ny tid</th>
          <th>{{ trackLabel }} {{ filter.track }}</th>
        </tr>
      </thead>
      <tbody>
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
          :class="{ 'trip--cancelled': trip.cancelled }"
          @click="getJourneyDetails(trip)">
          <td
            :style="{ backgroundColor: trip.fgColor, color: trip.bgColor }"
            class="trip-line">
            {{ trip.sname }}
          </td>
          <td class="trip-time">{{ trip.time }}</td>
          <td class="trip-dest">
            <div>
              <span class="trip-dest-name">
                {{ trip.direction || trip.origin }}
              </span>
              <span v-if="trip.isAffected">&nbsp;⛔️</span>
              <span v-if="trip.cancelled">&nbsp;⚠️ Färd inställd</span>
            </div>
            <div class="trip-dest-via"><small v-if="trip.via"> via {{ trip.via }}</small></div>
          </td>
          <td class="trip-time is-late"><span v-if="trip.isLate">{{ trip.rtTime }}</span></td>
          <td class="trip-track">{{ trip.track }}</td>
        </tr>
        <tr v-show="!isLoading && from && trips.length === 0">
          <td colspan="5">Inga resor att visa</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapState } from 'vuex';

import { apiDict } from '../api';

export default {
  name: 'TripsTable',
  props: {
    trips: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Object,
      default: null
    },
    from: {
      type: String,
      default: ''
    },
    fromToLabel: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState(['locationApi']),
    metaLabel() {
      return apiDict[this.locationApi].sname;
    },
    trackLabel() {
      return apiDict[this.locationApi].track;
    }
  },
  methods: {
    getJourneyDetails(trip) {
      if (!trip.JourneyDetailRef) return;
      window.VT.getJourneyDetail(trip.JourneyDetailRef.ref).then((resp) => {
        window.tripDetails = resp.Stop;
      });
    }
  }
};
</script>
<style>
.trips-table {
  width: 100%;
}
.trips-table table {
  background-color: white;
  border: 0;
  border-collapse: collapse;
  color: rgb(0, 57, 77);
  width: 100%;
}
.trips-table thead,
.trips-table thead select {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
}

.trips-table thead select {
  -webkit-appearance: none;
  font-size: 1em;
  border: 0;
}
.trips-table thead select:focus {
  outline: none;
}

.trips-table th {
  font-weight: normal;
  text-align: left;
}

.trips-table tbody tr:nth-child(even) {
  background: #eee;
}

.trips-table td,
.trips-table th {
  padding: 0.5em;
}

.trips-table .trip-line {
  padding: 0.5em;
  text-align: center;
  width: 50px;
}

.trips-table .trip--cancelled .trip-dest-name {
  text-decoration: line-through;
}
.trips-table .trip-dest {
}
.trips-table .trip-dest-name {
  font-weight: 500;
}
.trips-table .trip-dest-via {
}
.trips-table .trip-time {
  width: 60px;
}
.trips-table .trip-time.is-late {
  color: var(--brand-color);
}
.trips-table .trip-track {
  text-align: center;
  width: 50px;
}
</style>
