const clientTitleMixin = {
  watch: {
    screenTitle(newVal) {
      if (newVal && document.title !== newVal) {
        document.title = newVal
      }
    },
  },
  mounted() {
    const title = this.screenTitle
    if (title) {
      document.title = title
    }
  },
  beforeDestroy() {
    document.title = 'App Name'
  },
}

const serverTitleMixin = {
  created() {
    const title = this.screenTitle
    if (title) {
      this.$ssrContext.title = title
    }
  },
}

export default (process.env.VUE_ENV === 'server'
  ? serverTitleMixin
  : clientTitleMixin)
