<template>
  <div :class="$style.container">
    Hello
  </div>
</template>

<script>
import homeStore from 'mediators/appName/store'
export default {
  name: 'HomePage',
  vuexModules: {
    home: homeStore,
  },
  computed: {
    foo() {
      return this.$store.state.home.foo
    },
  },
}
</script>

<style lang="scss" module>
.container {
  height: 100%;
  background-color: #fafafa;
}
</style>
