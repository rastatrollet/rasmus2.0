import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMap,
  faPlay,
  faSync,
  faCheck,
  faPause,
  faFilter,
  faSpinner,
  faVolumeUp,
  faVolumeOff,
  faInfoCircle,
  faCrosshairs
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faMap,
  faPlay,
  faSync,
  faCheck,
  faPause,
  faFilter,
  faSpinner,
  faVolumeUp,
  faVolumeOff,
  faInfoCircle,
  faCrosshairs
);

Vue.component('font-awesome', FontAwesomeIcon);
