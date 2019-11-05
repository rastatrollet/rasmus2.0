<template>
  <aside :class="[$style.contaier, { [$style.contaierVisible]: beforeInstallPrompt }]">
    <img :class="$style.img" src="img/icons/android-chrome-512x512.png" alt="app logo" />
    <h3 :class="$style.heading">Lägg till på hemskärmen?</h3>
    <p :class="$style.website">{{ url }}</p>
    <div :class="$style.actions">
      <a href="#" :class="$style.link" @click="closeToaster">Avbryt</a>
      <a href="#" :class="$style.link" @click="onAddToHomeScreen">Lägg till</a>
    </div>
  </aside>
</template>
<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'InstallToHomeScreenPrompt',
  data() {
    return {
      prompted: false,
      url: ''
    };
  },
  computed: {
    ...mapState(['beforeInstallPrompt'])
  },
  mounted() {
    this.url = window.location.href.replace(/\/$/, '');
  },
  methods: {
    ...mapMutations(['setBeforeInstallPrompt']),
    closeToaster() {
      this.setBeforeInstallPrompt(null);
    },
    onAddToHomeScreen() {
      if (this.prompted) return;
      this.beforeInstallPrompt.prompt();
      this.prompted = true;
      this.beforeInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        this.closeToaster();
      });
    }
  }
};
</script>
<style module>
.contaier {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: blueviolet;
  color: white;
  display: grid;
  grid-template-columns: 20% auto;
  grid-gap: 0.3em 1em;
  align-items: center;
  padding: 1.5em;
  transition: transform 0.3s ease;
  transform: translateY(150%);
  will-change: transform;
}
.contaierVisible {
  z-index: 10;
  transform: translateY(0);
}

.img {
  grid-row: 1 / 3;
  grid-column: 1;
  max-width: 100%;
}

.heading,
.website {
  margin: 0;
}

.website {
  color: rgba(255, 255, 255, 0.75);
}

.actions {
  grid-column: 2;
  display: flex;
  justify-content: flex-end;
  margin-top: 1em;
}

.link {
  color: inherit;
  text-transform: uppercase;
  text-decoration: none;
}

.link + .link {
  margin-left: 1em;
}

.closeBtn {
  padding: 1em;
  position: absolute;
  top: 0;
  right: 0;
}
</style>
