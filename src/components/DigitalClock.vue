<template>
  <div class="digital-clock">
    {{ hours }}:{{ minutes }}:{{ seconds }}
  </div>
</template>
<script>
import debounce from '../util/debounce';
import isVisibleInDOM from '../util/isVisibleInDOM';

export default {
  name: 'DigitalClock',
  data() {
    return {
      intervalId: null,
      hours: '',
      minutes: '',
      seconds: ''
    };
  },
  created() {
    this.handleResize = debounce(this.handleResize, 250);
  },
  mounted() {
    this.updateDateTime();
    this.startInterval();
    this.handleResize();
    window.addEventListener('resize', this.handleResize, false);
  },
  beforeDestroy() {
    this.stopInterval();
    window.removeEventListener('resize', this.handleResize, false);
  },
  methods: {
    handleResize() {
      if (isVisibleInDOM(this.$el)) {
        this.startInterval();
      } else {
        this.stopInterval();
      }
    },
    startInterval() {
      this.stopInterval();
      this.intervalId = setInterval(this.updateDateTime, 1000);
    },
    stopInterval() {
      clearInterval(this.intervalId);
    },
    updateDateTime() {
      const now = new Date();
      this.hours = String(now.getHours()).padStart(2, '0');
      this.minutes = String(now.getMinutes()).padStart(2, '0');
      this.seconds = String(now.getSeconds()).padStart(2, '0');
    }
  }
};
</script>
<style>
.digital-clock {
  background: var(--brand-color);
  color: var(--brand-text-color-dim);
  flex: 1;
  display: none;
  align-items: center;
  justify-content: flex-end;
  font-family: monospace;
  font-size: 1.2em;
  font-weight: bold;
  padding: 0.5em 1em;
}
@media (min-width: 450px) {
  .digital-clock {
    display: flex;
  }
}
</style>
