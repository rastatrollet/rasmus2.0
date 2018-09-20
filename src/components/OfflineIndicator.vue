<template>
  <div
    v-if="!isOnline"
    :class="$style.offlineIndicator">
    Ingen internetanslutning 😥
  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'OfflineIndicator',
  computed: {
    ...mapState({
      isOnline: (state) => state.online
    })
  }
};
</script>
<style module>
.offlineIndicator {
  background: darkred;
  color: white;
  font-size: smaller;
  padding: 0.5em;
  text-align: center;
}
</style>
