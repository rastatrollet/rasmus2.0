import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMap,
  faSync,
  faCheck,
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
  faSync,
  faCheck,
  faFilter,
  faSpinner,
  faVolumeUp,
  faVolumeOff,
  faInfoCircle,
  faCrosshairs
);

Vue.component('font-awesome', FontAwesomeIcon);
