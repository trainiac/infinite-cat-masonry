<template>
  <div :class="$style.container">
    <div :class="[$style.bounce, $style.bounce1, $style[color]]" />
    <div :class="[$style.bounce, $style.bounce2, $style[color]]" />
    <div :class="[$style.bounce, $style.bounce3, $style[color]]" />
    <div :class="$style.placeholder">X</div>
    <div :class="$style.placeholder">X</div>
    <div :class="$style.placeholder">X</div>
  </div>
</template>

<script>
export default {
  props: {
    color: {
      type: String,
      required: false,
      default: 'purple',
    },
  },
}
</script>

<style lang="scss" module>
$bounceWidth: 1.145em;

.purple {
  background-color: #aaf;
}

.container {
  position: relative;
  display: inline-block;
  line-height: 1.2;
}

.placeholder {
  visibility: hidden;
  display: inline-block;
  width: $bounceWidth;
}

.bounce {
  position: absolute;
  width: $bounceWidth;
  height: 100%;
  border-radius: 100%;
  display: inline-block;
  animation: sk-bouncedelay 1s infinite ease-in-out both;
}

.bounce1 {
  left: 0;
  animation-delay: -0.32s;
}

.bounce2 {
  left: 35%;
  animation-delay: -0.16s;
}

.bounce3 {
  right: 0;
}

@keyframes sk-bouncedelay {
  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}
</style>
