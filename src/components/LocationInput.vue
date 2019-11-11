<template>
  <div
    :class="[$style.locationInput, { [$style.withLabel]: label }]"
    @focus="showDropDown"
    @keyup.esc="hideDropDown"
  >
    <label :class="[$style.label]">
      <input
        ref="input"
        v-model="searchText"
        :disabled="disabled"
        :class="[$style.input]"
        type="search"
        :placeholder="label"
        @input="onInput"
        @focus="showDropDown"
        @keyup.enter="selectFirstSuggestion"
        @keyup="handleKeyInput"
      />
      <font-awesome
        v-if="isLoading"
        :class="$style.spinner"
        icon="spinner"
        spin
        aria-hidden="true"
      />
      <Button
        v-if="selectedLocation"
        :class="$style.resetLocationBtn"
        :onClick="resetLocation"
        icon="times"
      />
    </label>

    <div v-show="show" :class="$style.suggestionsFocusTrap" @click.prevent="hideDropDown" />
    <div
      v-show="show"
      :class="$style.suggestions"
      :style="{ left: leftOffset, width: sugestionsWidth }"
    >
      <button
        v-if="showUseMyLocation"
        :class="[$style.suggestion, $style.nearbySuggestion]"
        @keyup="handleKeyInput"
        @click.prevent="getNearbyStops"
      >
        <font-awesome icon="crosshairs" />
        <span>{{ nearbyStopsMessage }}</span>
        <font-awesome v-if="isLoadingNearbyStops" icon="spinner" spin />
      </button>
      <button
        v-for="suggestion in allSuggestions"
        :key="suggestion.id"
        :class="[$style.suggestion, suggestion.isFavorite && $style.suggestionFavorite]"
        @keyup="handleKeyInput"
        @click.prevent="onSelect(suggestion)"
        @keyup.space="onSelect(suggestion)"
      >
        {{ suggestion.name }}
        <a href="#" @click.stop="favourize(suggestion)">
          <font-awesome icon="heart" />
        </a>
      </button>
      <button
        v-if="searchText && !stops.length && !isLoading"
        :class="$style.suggestion"
        @click.prevent
      >
        Inga resultat för söktermen
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

import Button from './Button.vue';
import debounce from '../util/debounce';

const keyToNextElementDict = {
  ArrowUp: 'previousElementSibling',
  ArrowDown: 'nextElementSibling'
};

export default {
  name: 'LocationInput',
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
    ...mapGetters({ isLoadingNearbyStops: 'user/isLoading' }),
    ...mapState({ apiName: ({ api }) => api.name }),
    ...mapState('user', ['nearbyStops', 'nearbyStopsError']),
    ...mapState('stops', ['stops', 'isLoading', 'favorites']),
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
    },
    filteredNearbyStops() {
      if (!this.showNearbyStops) return [];
      return this.nearbyStops;
    },
    allSuggestions() {
      const favs = this.favorites.filter(({ region }) => region === this.apiName);
      const favIds = favs.map(({ id }) => id);
      const isFav = ({ id }) => !favIds.includes(id);
      return [...favs, ...this.filteredNearbyStops.filter(isFav), ...this.stops.filter(isFav)];
    }
  },
  watch: {
    selectedLocation(newVal) {
      if (!newVal) this.searchText = '';
    }
  },
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
  methods: {
    ...mapActions('user', ['getUserLocation', 'getNearbyStops']),
    ...mapActions('stops', ['findStops', 'addFavorite', 'removeFavorite']),
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
    favourize(favorite) {
      if (favorite.isFavorite) {
        this.removeFavorite(favorite);
      } else {
        this.addFavorite({ ...favorite, isFavorite: true });
      }
    },
    handleKeyInput({ key }) {
      const btnElSelector = `.${this.$style.suggestions} button`;

      const getSibling = (el) => el[keyToNextElementDict[key]];

      if (['ArrowDown', 'ArrowUp'].includes(key) && this.show && this.hasSuggestions) {
        const focusedBtn = this.$el.querySelector(`${btnElSelector}:focus`);
        if (focusedBtn) {
          const nextBtn = getSibling(focusedBtn);
          if (nextBtn) {
            nextBtn.focus();
          }
        } else {
          this.$el.querySelector(btnElSelector).focus();
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
  border: 1px solid var(--brand-color);
  border-radius: 2px;
  font: inherit;
  flex: 1;
  padding: 0 0.5em;
}
.input:focus {
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
  padding: 5px 10px;
  position: absolute;
  right: 4px;
  top: 4px;
  height: calc(100% - 8px);
}

.suggestionsFocusTrap {
  background: transparent;
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
}

.suggestions {
  display: flex;
  flex-direction: column;
  background: var(--brand-color);
  font-size: 1em;
  margin: 0;
  position: absolute;
  top: 33px;
  z-index: 10;
}

.suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-appearance: none;
  background: transparent;
  border: 0;
  color: white;
  cursor: pointer;
  font-size: 1em;
  padding: 0.5em 0.75em;
  margin: 0;
  text-align: left;
  text-decoration: none;
  width: 100%;
}

.suggestion a {
  color: rgba(255, 255, 255, 0.25);
}

.suggestionFavorite a {
  color: white;
}

.nearbySuggestion {
  justify-content: flex-start;
}

.suggestion + .suggestion {
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.suggestion:hover,
.suggestion:focus {
  background: whitesmoke;
  color: var(--brand-color);
  outline: none;
}
</style>
