import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCog,
  faMap,
  faPlay,
  faSync,
  faTimes,
  faCheck,
  faPause,
  faFilter,
  faSpinner,
  faVolumeUp,
  faVolumeOff,
  faInfoCircle,
  faCrosshairs,
  faPlaneArrival,
  faPlaneDeparture
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faCog,
  faMap,
  faPlay,
  faSync,
  faTimes,
  faCheck,
  faPause,
  faFilter,
  faSpinner,
  faVolumeUp,
  faVolumeOff,
  faInfoCircle,
  faCrosshairs,
  faPlaneArrival,
  faPlaneDeparture
);

Vue.component('font-awesome', FontAwesomeIcon);
