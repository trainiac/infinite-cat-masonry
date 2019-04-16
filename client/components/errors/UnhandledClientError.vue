<template>
  <div
    id="debug-dialog"
    :class="{ [$style.wrapper]: true, [$style.hide]: !isOpen }"
  >
    <div :class="$style.container">
      <h1>{{ title }}</h1>
      <h3>{{ message }}</h3>
      <pre key="stack">{{ stack }}</pre>
      <pre key="details">{{ details }}</pre>
      <button :class="$style.btn" @click.native="$emit('requestClose')">
        Got It
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnhandledClientError',
  props: {
    title: String,
    message: String,
    stack: String,
    details: String,
    isOpen: Boolean,
  },
}
</script>

<style lang="scss" module>
:global(#app) {
  .btn {
    // TODO import styles manually
    //@include flat-button;
    //@include solid-button-color(#fff, $green);
    display: block;
    width: 10rem;
    margin: 2rem auto;
  }
}

.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 9999999;
  background-color: #fff;
  overflow: scroll;
}

.hide {
  display: none;
}

.container {
  margin-top: 5rem;
  margin-left: 5rem;
}

.image {
  width: 400px;
  display: block;
  margin: 0 auto;
}
</style>
