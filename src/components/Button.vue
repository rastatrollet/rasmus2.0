<template>
  <button
    :class="[$style.button, className]"
    :type="type"
    :title="title"
    @click.prevent="onClick">
    {{ text }}
    <font-awesome 
      v-if="icon" 
      :icon="['fas', icon]" />
  </button>
</template>
<script>
export default {
  name: 'Button',
  props: {
    className: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'button'
    },
    title: {
      type: String,
      default: ''
    },
    onClick: {
      type: Function,
      default: () => {}
    },
    text: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: null
    }
  }
};
</script>
<style module>
.button {
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  margin: 0;
  overflow: visible;
  padding: 0.5em 1em;
  user-select: none;
  width: auto;
}
.button:focus {
  outline: none;
}
</style>
