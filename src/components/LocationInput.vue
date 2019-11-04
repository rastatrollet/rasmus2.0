<template>
  <div
    :class="[$style.locationInput, { [$style.withLabel]: label }]"
    @focus="showDropDown"
    @keyup.esc="hideDropDown"
  >
    <label :class="[$style.label]">
      <span :class="[$style.labelText]">{{ label }}:</span>
      <input
        ref="input"
        v-model="searchText"
        :disabled="disabled"
        :class="[$style.input]"
        type="search"
        placeholder
        @input="onInput"
        @focus="showDropDown"
        @blur="possiblyHideDropDown"
        @keyup.enter="selectFirstSuggestion"
        @keyup="handleKeyInput"
      />
      <font-awesome
        :class="$style.spinner"
        icon="spinner"
        spin
        v-if="isLoading"
        aria-hidden="true"
      />
      <Button
        v-if="selectedLocation"
        :class="$style.resetLocationBtn"
        :onClick="resetLocation"
        icon="times"
      />
    </label>

    <ul
      v-show="show"
      :class="$style.suggestions"
      :style="{ left: leftOffset, width: sugestionsWidth }"
    >
      <li v-if="showUseMyLocation" :class="$style.suggestion" @keyup="handleKeyInput">
        <button @click.prevent="getNearbyStops">
          <font-awesome icon="crosshairs" />
          <span>{{ nearbyStopsMessage }}</span>
          <font-awesome v-if="isLoadingNearbyStops" icon="spinner" spin />
        </button>
      </li>
      <li
        v-for="stop in nearbyStops"
        v-if="showNearbyStops"
        :key="stop.name"
        :class="$style.suggestion"
        @keyup="handleKeyInput"
      >
        <button @click.prevent="onSelect(stop)" @keyup.space="onSelect(stop)">
          {{ stop.name }}
        </button>
      </li>
      <li v-if="searchText && !stops.length && !isLoading" :class="$style.suggestion">
        <button @click.prevent>Inga resultat för söktermen</button>
      </li>
      <li
        v-for="suggestion in stops"
        :key="suggestion.id"
        :class="$style.suggestion"
        @keyup="handleKeyInput"
      >
        <button @click.prevent="onSelect(suggestion)" @keyup.space="onSelect(suggestion)">
          {{ suggestion.name }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

import Button from './Button.vue';
import debounce from '../util/debounce';

export default {
  name: 'LocationInput',
  mounted() {
    this.debouncedFindStops = debounce(this.findStops, 350, this);
    if (this.selectedLocation) {
      this.searchText = this.selectedLocation.name;
      this.debouncedFindStops(this.selectedLocation.name);
    }
    const { offsetLeft, clientWidth } = this.$refs.input;
    this.leftOffset = `${offsetLeft}px`;
    this.sugestionsWidth = `${clientWidth + 2}px`;
  },
  components: {
    Button
  },
  props: {
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false,
      searchText: '',
      leftOffset: 0,
      sugestionsWidth: 'auto'
    };
  },
  computed: {
    ...mapGetters('api', ['api']),
    ...mapGetters({ isLoadingNearbyStops: 'user/isLoading' }),
    ...mapState('user', ['nearbyStops', 'nearbyStopsError']),
    ...mapState('stops', ['stops', 'isLoading']),
    ...mapState({
      userLocation: ({ user }) => user.location,
      selectedLocation: ({ trips }) => trips.location
    }),
    nearbyStopsMessage() {
      if (this.isLoadingNearbyStops) return 'Hämtar närliggande hållplatser';
      return this.nearbyStopsError || 'Använd min plats';
    },
    showUseMyLocation() {
      return !this.searchText && !this.nearbyStops.length;
    },
    showNearbyStops() {
      return !this.searchText && this.nearbyStops.length;
    },
    hasSuggestions() {
      return this.stops.length || this.nearbyStops.length;
    }
  },
  watch: {
    selectedLocation(newVal) {
      if (!newVal) this.searchText = '';
    }
  },
  methods: {
    ...mapActions('user', ['getUserLocation', 'getNearbyStops']),
    ...mapActions('stops', ['findStops']),
    ...mapActions('trips', ['updateLocation']),
    onInput({ target: { value } }) {
      this.debouncedFindStops(value);
    },
    onSelect(location) {
      this.searchText = location.name;
      this.updateLocation(location);
      this.hideDropDown();
      this.findStops(location.name).then(this.hideDropDown);
    },
    selectFirstSuggestion() {
      if (this.stops.length === 0) return;
      this.onSelect(this.stops[0]);
    },
    handleKeyInput(e) {
      const dict = {
        ArrowUp: 'previousElementSibling',
        ArrowDown: 'nextElementSibling'
      };
      const btnElement = 'button';

      const getSibling = (el) => el.parentElement[dict[e.key]];

      if (['ArrowDown', 'ArrowUp'].includes(e.key) && this.show && this.hasSuggestions) {
        const focused = this.$el.querySelector(`.${this.$style.suggestions} ${btnElement}:focus`);
        if (focused) {
          const next = getSibling(focused);
          if (next) {
            next.querySelector(btnElement).focus();
          }
        } else {
          this.$el.querySelector(`.${this.$style.suggestions} ${btnElement}`).focus();
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
    },
    resetLocation() {
      this.updateLocation(null);
    }
  }
};
</script>

<style module>
.locationInput {
  position: relative;
  line-height: 2em;
  margin-top: 0;
}

.label {
  display: flex;
  position: relative;
}

.labelText {
  padding-right: 0.3em;
}

.input {
  -webkit-appearance: none;
  border: 1px solid whitesmoke;
  font: inherit;
  flex: 1;
  padding: 0 0.5em;
}
.input:focus {
  border: 1px solid gray;
  outline: none;
}

.spinner {
  position: absolute;
  right: 0.5em;
  top: 25%;
}

.resetLocationBtn {
  background: white;
  line-height: 1em;
  padding: 8px;
  position: absolute;
  right: 1px;
  top: 1px;
  height: 100%;
}

.suggestions {
  background: var(--brand-color);
  list-style: none;
  font-size: 0.875em;
  padding: 0;
  position: absolute;
  top: 1.5em;
  z-index: 10;
}

.suggestion:first-child {
  border-top: 1px solid var(--brand-color);
}
.suggestion:first-child:before {
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

.suggestion button {
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

.suggestion:first-child button {
  padding-top: 0.75em;
}
.suggestion:last-child button {
  padding-bottom: 0.75em;
}

.suggestions button:hover,
.suggestions button:focus {
  background: whitesmoke;
  color: var(--brand-color);
  outline: none;
}
</style>
