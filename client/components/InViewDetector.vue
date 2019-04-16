<template>
  <div><slot /></div>
</template>

<script>
import inViewport from 'element-in-view'
import { throttle } from 'utils/lang'
const throttleDuration = 200

export default {
  props: {
    activate: {
      type: Boolean,
      required: true,
    },
  },
  watch: {
    activate(newVal) {
      if (newVal) {
        this.bindListeners()
        this.check()
      } else {
        this.removeListeners()
      }
    },
  },
  mounted() {
    if (this.activate) {
      this.bindListeners()
      this.check()
    }
  },
  beforeDestroy() {
    this.removeListeners()
  },
  methods: {
    check() {
      const inView = inViewport(this.$el, {
        offset: window.innerHeight * -1,
      })
      if (this.activate && inView) {
        this.$emit('inView')
      }
    },
    bindListeners() {
      if (!this.boundFn) {
        this.boundFn = throttle(this.check.bind(this), throttleDuration)
        const container = window
        container.addEventListener('scroll', this.boundFn)
        container.addEventListener('resize', this.boundFn)
      }
    },
    removeListeners() {
      if (this.boundFn) {
        const container = window
        container.removeEventListener('scroll', this.boundFn)
        container.removeEventListener('resize', this.boundFn)
        this.boundFn = null
      }
    },
  },
}
</script>
