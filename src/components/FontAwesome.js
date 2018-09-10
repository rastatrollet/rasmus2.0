import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMap,
  faInfoCircle,
  faSpinner,
  faCrosshairs,
  faFilter,
  faVolumeUp,
  faVolumeOff,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(
  faMap,
  faCheck,
  faInfoCircle,
  faSpinner,
  faCrosshairs,
  faFilter,
  faVolumeUp,
  faVolumeOff
);

Vue.component('font-awesome', FontAwesomeIcon);
