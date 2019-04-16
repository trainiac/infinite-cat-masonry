<template>
  <div id="app" :class="$style.container" :data-page-loaded="loaded">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      loaded: false,
    }
  },
  mounted() {
    window.addEventListener('load', () => {
      this.loaded = true
    })
  },
}
</script>

<style lang="scss" module>
.container {
  height: 100%;
}
</style>
