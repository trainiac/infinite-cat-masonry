<template>
  <div>
    <slot v-if="direction === 'below'" />
    <InViewDetector
      v-if="continueLoading"
      :activate="activate"
      :class="$style.detector"
      @inView="$emit('requestMore')"
    >
      <BouncyBallsLoader :class="$style.loader" color="green" />
    </InViewDetector>
    <slot v-if="direction === 'above'" />
  </div>
</template>

<script>
import BouncyBallsLoader from 'components/BouncyBallsLoader'
import InViewDetector from 'components/InViewDetector'

export default {
  components: {
    BouncyBallsLoader,
    InViewDetector,
  },
  props: {
    direction: {
      type: String,
      default: 'below',
    },
    continueLoading: {
      type: Boolean,
    },
    activate: {
      type: Boolean,
    },
  },
}
</script>

<style lang="scss" module>
.detector {
  text-align: center;
  padding: 2rem 0;
}
.loader {
  font-size: 1.2em;
}
</style>
