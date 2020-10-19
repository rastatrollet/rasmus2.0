<template>
  <div :class="[$style.updateAvailable, { [$style.updateAvailableActive]: hasUpdate }]">
    🎉
    <strong>Uppdatering tillgänglig</strong> 🎉
    <br />
    <a :class="$style.reloadLink" href="#" @click.prevent="reload">Ladda om</a>
    för att uppdatera 😆
    <Button icon="times" :className="$style.closeBtn" :onClick="closeUpdateToaster" title="Stäng" />
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
import Button from './Button.vue';

export default {
  name: 'UpdateAvailable',
  components: {
    Button,
  },
  computed: {
    ...mapState({
      hasUpdate: (state) => state.updateAvailable,
    }),
  },
  methods: {
    ...mapMutations(['setUpdateAvailable']),
    closeUpdateToaster() {
      this.setUpdateAvailable(false);
    },
    reload() {
      window.location.reload();
    },
  },
};
</script>
<style module>
.updateAvailable {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: purple;
  color: white;
  padding: 1em 2em 2em;
  text-align: center;
  transition: transform 0.3s ease;
  transform: translateY(150%);
  will-change: transform;
}

.updateAvailableActive {
  z-index: 10;
  transform: translateY(0);
}

.reloadLink {
  color: inherit;
}

.closeBtn {
  padding: 1em;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
