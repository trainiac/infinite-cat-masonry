<template>
  <div
    v-if="isOpen"
    id="webpack-loader-dialog"
    :class="{
      [$style.wrapper]: true,
      [$style.hide]: !isOpen,
    }"
  >
    <div :class="$style.container">
      <h3>Webpack Building</h3>
      <!-- insert spinner -->
    </div>
  </div>
</template>

<script>
// TODO insert spinner
export default {
  name: 'WebpackCompiling',
  props: {
    isOpen: Boolean,
  },
}
</script>

<style lang="scss" module>
.container {
  background-color: #fff;
  text-align: center;
  padding: 1rem;
  border-radius: 5px;
}

.wrapper {
  position: fixed;
  top: 100px;
  left: 50%;
  z-index: 99999999;
  box-shadow: 0 8px 6px -6px black;
  transform: translateX(-50%);
}

.hide {
  display: none;
}
</style>
