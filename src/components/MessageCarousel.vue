<template>
  <div :class="$style.carousel">
    <div
      @touchstart="onTouchStart"
      :class="$style.items"
      :style="{ transform: `translateX(${translateX})` }">
      <div
        :class="$style.item"
        v-for="(msg, idx) in messages"
        :key="idx">
        {{ msg }}
      </div>
    </div>
    <div
      :class="$style.item"
      v-if="messages.length === 0">Inga trafikstörningar.</div>
    <div :class="$style.dots">
      <button
        :class="$style.playPauseBtn"
        @click="playPause">
        <font-awesome :icon="['fas', intervalId ? 'pause' : 'play']" />
      </button>
      <button
        :class="$style.dotBtn"
        v-for="(msg, idx) in messages"
        :key="msg"
        @click="setActive(idx)">
        <div :class="[$style.dot, { [$style.activeDot]: active === idx }]" />
      </button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'MessageCarousel',
  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      active: 0,
      intervalId: null,
      wait: 5000
    };
  },
  computed: {
    translateX() {
      return this.active * -100 + '%';
    }
  },
  mounted() {
    this.play();
  },
  beforeDestroy() {
    this.pause();
  },
  methods: {
    setActive(value) {
      this.pause();
      this.active = value;
      this.play();
    },
    selectNextActive() {
      this.active = (this.active + 1) % this.messages.length;
    },
    play() {
      this.intervalId = setInterval(this.selectNextActive, this.wait);
    },
    pause() {
      clearInterval(this.intervalId);
      this.intervalId = null;
    },
    playPause() {
      if (this.intervalId) {
        this.pause();
      } else {
        this.play();
      }
    },
    onTouchStart(startEvt) {
      const target = startEvt.target;
      const startX = startEvt.changedTouches[0].clientX;
      const onTouchEnd = (endEvt) => {
        target.removeEventListener('touchend', onTouchEnd);
        const endX = endEvt.changedTouches[0].clientX;
        const deltaX = startX - endX;
        const wasSwipe = Math.abs(deltaX) > 50;
        if (!wasSwipe) return;
        if (deltaX > 0) {
          this.setActive((this.active + 1) % this.messages.length);
        } else {
          this.setActive(
            this.active > 0 ? this.active - 1 : this.messages.length - 1
          );
        }
      };
      target.addEventListener('touchend', onTouchEnd);
    }
  }
};
</script>
<style module>
.carousel {
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  padding: 1em 0;
}

.playPauseBtn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: none;
  font-size: 1em;
  margin-right: 0.5em;
  padding: 0;
}
.playPauseBtn:hover,
.playPauseBtn:focus {
  color: rgba(255, 255, 255, 0.85);
  outline: none;
  transform: scale(1.2);
}

.items {
  display: flex;
  transition: transform 0.3s ease-in-out;
  width: 100%;
  will-change: transform;
}

.item {
  line-height: 1.5em;
  flex: 0 0 100%;
  padding: 0 1em;
}

.dots {
  display: flex;
  margin-top: 0.5em;
}

.dotBtn {
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 1em;
}
.dotBtn:focus {
  outline: none;
}

.dot {
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  width: 7px;
  height: 7px;
}
.activeDot {
  background-color: rgba(255, 255, 255, 0.85);
}
</style>
