<template>
  <div
    :class="{ 'with-label': label }"
    class="location-input"
    @focus="showDropDown"
    @keyup.esc="hideDropDown">

    <label>
      {{ label }}:
      <input
        v-model="searchText"
        :disabled="disabled"
        type="search"
        placeholder=""
        @input="onInput"
        @focus="showDropDown"
        @blur="possiblyHideDropDown"
        @keyup.enter="selectFirstSuggestion"
        @keydown="handleKeyInput">
      <font-awesome
        class="location-input__spinner"
        icon="spinner"
        :spin="isLoading"
        v-if="isLoading"
        aria-hidden="true"/>
    </label>

    <ul
      v-show="show"
      class="location-input__suggestions">
      <li
        v-if="nearbyStations.length === 0"
        class="location-input__suggestion"
        @keyup="handleKeyInput">
        <button @click.prevent="getNearbyStops">
          <font-awesome icon="crosshairs"/>
          <span v-if="!fetchingNearbyStops"> Använd min plats</span>
          <span v-if="fetchingNearbyStops">
            Hämtar närliggande hållplatser
            <font-awesome
              icon="spinner"
              spin/>
          </span>
        </button>
      </li>
      <li
        v-for="station in nearbyStations"
        v-if="suggestions.length === 0 && !searchText"
        :key="station.name"
        class="location-input__suggestion"
        @keyup="handleKeyInput">
        <button
          @click.prevent="onSelect(station)"
          @keyup.space="onSelect(station)">{{ station.name }}</button>
      </li>
      <li
        v-if="suggestions.length === 0 && searchText && !isFetching"
        class="location-input__suggestion">
        <button @click.prevent>Inga resultat för söktermen</button>
      </li>
      <li
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="location-input__suggestion"
        @keyup="handleKeyInput">
        <button
          @click.prevent="onSelect(suggestion)"
          @keyup.space="onSelect(suggestion)">{{ suggestion.name }}</button>
      </li>
    </ul>
  </div>
</template>
<script>
import { mapState } from 'vuex';

import { getPositionPromise } from '../util/geoLocation';
import debounce from '../util/debounce';
import apis from '../api';

export default {
  name: 'LocationInput',
  props: {
    label: {
      type: String,
      default: ''
    },
    location: {
      type: Object,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    parentLoading: {
      type: Boolean,
      default: false
    },
    displayNearbyStops: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false,
      isFetching: false,
      fetchingNearbyStops: false,
      searchText: '',
      suggestions: [],
      nearbyStations: []
    };
  },
  computed: {
    ...mapState(['locationApi']),
    isLoading() {
      return this.isFetching || this.parentLoading;
    },
    hasSuggestions() {
      return this.suggestions.length || this.nearbyStations.length;
    }
  },
  watch: {
    locationApi(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.suggestions = [];
        if (this.location && this.location.name) {
          this.debouncedGetSuggestions(this.location.name);
        }
      }
    }
  },
  mounted() {
    if (this.location) {
      this.searchText = this.location.name;
    }
    this.debouncedGetSuggestions = debounce(this.getSuggestions, 350, this);
  },
  methods: {
    getNearbyStops() {
      this.nearbyStations = [];
      this.fetchingNearbyStops = true;
      getPositionPromise()
        .then(apis[this.locationApi].getClosestStops)
        .then((stations) => {
          // only update nearbyStations promise resolves with correct data
          if (
            stations &&
            stations.length &&
            stations[0].region === this.locationApi
          ) {
            this.nearbyStations = stations || [];
          }
          this.fetchingNearbyStops = false;
        })
        .catch((reason) => {
          console.error(reason);
          this.fetchingNearbyStops = false;
        });
    },
    onInput({ target: { value } }) {
      if (!value) {
        this.suggestions = [];
      } else {
        this.isFetching = true;
        this.debouncedGetSuggestions(value);
      }
    },
    getSuggestions(value) {
      return apis[this.locationApi].findStops(value).then((stops) => {
        this.isFetching = false;
        this.suggestions = [].concat(stops);
        this.showDropDown();
      });
    },
    findNearestStop() {
      this.isFetching = true;
      getPositionPromise()
        .then(apis[this.locationApi].getClosestStop)
        .then((location) => {
          if (location) this.onSelect(location);
          this.show = false;
          this.isFetching = false;
          this.isLoading = false;
        });
    },
    onSelect(suggestion) {
      console.log('onSelect', suggestion);
      this.searchText = suggestion.name;
      this.$emit('set-location', suggestion);
      this.hideDropDown();
      this.getSuggestions(suggestion.name).then(this.hideDropDown);
    },
    selectFirstSuggestion() {
      if (this.suggestions.length === 0) return;
      this.onSelect(this.suggestions[0]);
    },
    handleKeyInput(e) {
      const dict = {
        ArrowUp: 'previousElementSibling',
        ArrowDown: 'nextElementSibling'
      };
      const btnElement = 'button';

      const getSibling = (el) => el.parentElement[dict[e.key]];

      if (
        ['ArrowDown', 'ArrowUp'].includes(e.key) &&
        this.show &&
        this.hasSuggestions
      ) {
        const focused = this.$el.querySelector(
          `.location-input__suggestions ${btnElement}:focus`
        );
        if (focused) {
          const next = getSibling(focused);
          if (next) {
            next.querySelector(btnElement).focus();
          }
        } else {
          this.$el
            .querySelector(`.location-input__suggestions ${btnElement}`)
            .focus();
        }
      }
    },
    showDropDown() {
      this.show = true;
    },
    hideDropDown() {
      this.show = false;
      document.activeElement.blur();
    },
    possiblyHideDropDown(e) {
      if (e.relatedTarget && this.$el.contains(e.relatedTarget)) return;
      this.hideDropDown();
    }
  }
};
</script>
<style>
.location-input {
  --left-offset: 80px;
  position: relative;
  line-height: 2em;
  margin: 0.5em 0;
}

.location-input .nearby-stations {
  list-style-type: none;
  padding: 0;
}

.location-input.with-label .nearby-stations {
  margin: 0 0 0 var(--left-offset);
  font-size: small;
}

.location-input .nearby-stations li {
  display: inline-block;
}
.location-input .nearby-stations .nearby-station {
  background: var(--brand-color);
  color: var(--brand-text-color);
  display: block;
  line-height: 1.5em;
  margin-left: 5px;
  padding: 0 0.5em;
  text-decoration: none;
}

.location-input label {
  display: block;
  position: relative;
}

.location-input input {
  -webkit-appearance: none;
  border: 1px solid whitesmoke;
  font: inherit;
  left: 0;
  padding: 0 0.5em;
  position: absolute;
  width: 100%;
}
.location-input input:focus {
  border: 1px solid gray;
  outline: none;
}

.location-input__spinner {
  position: absolute;
  right: 0.5em;
  top: 25%;
}

.location-input__suggestions {
  background: var(--brand-color);
  list-style: none;
  font-size: 0.875em;
  padding: 0;
  position: absolute;
  top: 1.5em;
  left: 0;
  width: 100%;
  z-index: 10;
}

.location-input__suggestion .fa {
  position: initial;
  margin-left: 0.5em;
}

.location-input.with-label input,
.location-input.with-label .location-input__suggestions {
  left: var(--left-offset);
  width: calc(100% - var(--left-offset));
}

.location-input__suggestion:first-child {
  border-top: 1px solid var(--brand-color);
}
.location-input__suggestion:first-child:before {
  --arrow-size: 5px;
  border-left: var(--arrow-size) solid transparent;
  border-right: var(--arrow-size) solid transparent;
  border-bottom: var(--arrow-size) solid var(--brand-color);
  content: '';
  display: block;
  position: absolute;
  top: -5px;
  left: 0.5em;
  width: 0;
  height: 0;
}

.location-input__suggestion button {
  -webkit-appearance: none;
  background: transparent;
  border: 0;
  color: white;
  cursor: pointer;
  display: block;
  font-size: 1em;
  padding: 0.5em 0.75em;
  text-align: left;
  text-decoration: none;
  width: 100%;
}

.location-input__suggestion:first-child button {
  padding-top: 0.75em;
}
.location-input__suggestion:last-child button {
  padding-bottom: 0.75em;
}

.location-input__suggestions button:hover,
.location-input__suggestions button:focus {
  background: whitesmoke;
  color: var(--brand-color);
  outline: none;
}
</style>
