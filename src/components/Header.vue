<template>
  <header :class="$style.header">
    <div :class="$style.title">
      <img :class="$style.logo" src="img/icons/apple-touch-icon-76x76.png" alt="app logo" />
      <span>Resmus</span>
    </div>
    <font-awesome v-if="isLoadingTrips" icon="spinner" spin />
    <span>{{ apiName }}</span>
  </header>
</template>

<script>
import { mapState } from 'vuex';

const apiNameMap = {
  VT: 'Västtrafik',
  TV: 'Trafikverket'
};

export default {
  name: 'Header',
  computed: {
    ...mapState({
      apiName: ({ api }) => apiNameMap[api.name]
    }),
    ...mapState('trips', {
      isLoadingTrips: ({ isLoading }) => isLoading
    })
  }
};
</script>

<style module>
.header {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
  display: flex;
  justify-content: space-between;
  padding: 0.5em;
}

.title {
  display: flex;
  align-items: center;
}

.logo {
  height: 1em;
  margin-right: 0.3em;
}

@supports (-webkit-overflow-scrolling: touch) {
  .header {
    padding-top: max(0.5em, env(safe-area-inset-top));
    padding-left: max(0.5em, env(safe-area-inset-left));
    padding-right: max(0.5em, env(safe-area-inset-right));
  }
}
</style>
