import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMap,
  faInfoCircle,
  faSpinner,
  faCrosshairs,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faMap, faInfoCircle, faSpinner, faCrosshairs, faFilter);

Vue.component('font-awesome', FontAwesomeIcon);
