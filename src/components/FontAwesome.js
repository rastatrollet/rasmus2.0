import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCog,
  faMap,
  faPlay,
  faSync,
  faHeart,
  faTimes,
  faCheck,
  faPause,
  faFilter,
  faSpinner,
  faVolumeUp,
  faVolumeOff,
  faInfoCircle,
  faCrosshairs,
  faMapMarkerAlt,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faCog,
  faMap,
  faPlay,
  faSync,
  faHeart,
  faTimes,
  faCheck,
  faPause,
  faFilter,
  faSpinner,
  faVolumeUp,
  faVolumeOff,
  faInfoCircle,
  faCrosshairs,
  faMapMarkerAlt,
  faExclamationCircle
);

Vue.component('font-awesome', FontAwesomeIcon);
