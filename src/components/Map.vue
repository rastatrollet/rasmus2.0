<template>
  <div :class="$style.mapContainer">
    <font-awesome v-if="initializing" :class="$style.initSpinner" icon="spinner" spin />
    <div :class="$style.mapStatus">
      <span>Uppdates every {{ (updateInterval / 1000).toFixed(1) }}s.</span>
      <font-awesome :icon="['fas', iconName]" :title="getLiveMapError" :spin="isLoadingLiveMap" />
      <label>
        Folllow me
        <input v-model="followMe" type="checkbox" />
      </label>
      <label>
        Show live
        <input v-model="showLiveMap" type="checkbox" />
      </label>
    </div>
    <div id="map" style="height: 100%" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import map from '../util/map';
import { getPositionPromise, transformPosition } from '../util/geoLocation';

function getUpdateInterval(zoomFactor) {
  return (4000000 / Math.pow(zoomFactor, 3)) * 2;
}

export default {
  name: 'MapComponent',
  data() {
    return {
      map: null,
      vehicles: [],
      markers: [],
      followMe: false,
      showLiveMap: false,
      getLiveMapRequestId: 0,
      getLiveMapError: '',
      initializing: true,
      isLoadingLiveMap: false,
      updateInterval: getUpdateInterval(13)
    };
  },
  computed: {
    ...mapState(['selectedJourney']),
    ...mapGetters('api', ['api']),
    iconName() {
      if (this.isLoadingLiveMap) return 'spinner';
      if (this.getLiveMapError) return 'warning';
      return 'check';
    }
  },
  watch: {
    followMe(doFollow) {
      if (doFollow) {
        console.log('following');
        this.followMeIntervalId = navigator.geolocation.watchPosition(
          (pos) => {
            console.log('updated user position', pos);
            map.centerOnMe(transformPosition(pos));
          },
          (error) => {
            console.log('following error', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000
          }
        );
      } else {
        console.log('unfollowing');
        navigator.geolocation.clearWatch(this.followMeIntervalId);
      }
    },
    showLiveMap(showLiveMap) {
      if (showLiveMap) {
        this.getLiveMap();
        this.updateMap();
      } else {
        this.removeMarkers();
        clearTimeout(this.timeoutId);
      }
    }
  },
  mounted() {
    console.log('mounted Map.vue');
    getPositionPromise().then((position) => {
      this.initializing = false;
      this.map = map.initMap({
        rootElement: document.getElementById('map'),
        position
      });

      this.setupEventListeners();
      this.updateMap();

      if (this.selectedJourney) {
        map.drawPolyLine(this.selectedJourney.Stop.map(({ lat, lon }) => [lat, lon]), '#009ddb');
        this.selectedJourney.Stop.forEach((hpl) => {
          const message = hpl.depDate
            ? `Avgår <time datetime="${hpl.depDate}">${hpl.depTime}</time> från läge ${hpl.track}`
            : `Ankommer <time datetime="${hpl.arrDate}">${hpl.arrTime}</time> till läge ${hpl.track}`;

          map.createMarker(
            [hpl.lat, hpl.lon],
            {},
            `
              <div>
                <h4>${hpl.name}</h4>
                <p>${message}</p>
              </div>
            `
          );
        });
      }
    });
  },
  beforeDestroy() {
    if (this.map) {
      this.map.off();
    }
    clearTimeout(this.timeoutId);
  },
  methods: {
    setupEventListeners() {
      this.map.on('moveend', this.getLiveMap);
      this.map.on('zoomend', () => {
        this.updateInterval = getUpdateInterval(this.map.getZoom());
      });
    },
    updateMap() {
      if (!this.showLiveMap) return;
      window.requestAnimationFrame(() => {
        this.timeoutId = setTimeout(() => {
          this.getLiveMap().then(this.updateMap);
        }, this.updateInterval);
      });
    },
    getLiveMap() {
      if (!this.showLiveMap) return;
      const requestId = ++this.getLiveMapRequestId;
      const [west, south, east, north] = this.map
        .getBounds()
        .toBBoxString()
        .split(',')
        .map(Number);
      this.isLoadingLiveMap = true;

      if (typeof this.api.getLiveMap !== 'function') return Promise.resolve();

      return this.api
        .getLiveMap({ south, west, north, east })
        .then((vehicles) => {
          this.plotVehicles(vehicles, requestId);
          this.getLiveMapError = '';
          this.isLoadingLiveMap = false;
        })
        .catch((reason) => {
          this.getLiveMapError = reason.toString();
          this.isLoadingLiveMap = false;
        });
    },
    plotVehicles(vehicles, requestId) {
      // only plot positions from latest request
      if (requestId !== this.getLiveMapRequestId) return;

      if (vehicles.length && vehicles.length !== this.markers.length) {
        console.log('vehicles', vehicles);
      }

      if (vehicles.length > 100) {
        vehicles = vehicles.filter(({ prodclass }) => prodclass !== 'BUS');
        console.log('too many vehicles, filtering out buses', vehicles.length);
      }

      const newMarkers = vehicles
        .filter(({ gid }) => !this.markers.some(({ options: { title } }) => gid === title))
        .map(map.createVehicleMarker);

      const oldMarkers = this.markers.reduce((res, marker) => {
        const vehicle = vehicles.find(({ gid }) => gid === marker.options.title);
        if (vehicle) {
          map.updateVehicleMarkerPosition(marker, vehicle);
          return [...res, marker];
        }
        this.map.removeLayer(marker); // remove from map
        return res;
      }, []);

      this.markers = [...oldMarkers, ...newMarkers];
    },
    removeMarkers() {
      this.markers.forEach((marker) => {
        this.map.removeLayer(marker);
      });
      this.markers = [];
    }
  }
};
</script>

<style module>
.mapContainer {
  height: 100%;
  position: relative;
}
.mapStatus {
  background-color: rgba(244, 244, 244, 0.7);
  border-radius: 2px;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
  color: var(--dark-text-color);
  content: '';
  display: block;
  font-size: 11px;
  padding: 0.2em 0.5em;
  position: absolute;
  right: 10px;
  top: 10px;
  user-select: none;
  z-index: 9999;
}
.initSpinner {
  font-size: 5vw;
  position: absolute;
  left: calc(50% - 2.5vw);
  top: calc(50% - 2.5vw);
}
</style>
