import Vue from 'vue'

export default function ImageLoader({ timeout }) {
  return new Vue({
    beforeDestroy() {
      this.stop()
    },
    methods: {
      loadImages(images) {
        this.timeoutIds = []
        const imagePromises = images.map(image => {
          return new Promise(resolve => {
            const imageEl = new Image()
            const timeoutId = setTimeout(() => {
              this.onFinish(image.id, imageEl, timeoutId, 'timeout', resolve)
            }, timeout)
            this.timeoutIds.push(timeoutId)
            imageEl.onerror = () => {
              this.onFinish(image.id, imageEl, timeoutId, 'error', resolve)
            }
            imageEl.onload = () => {
              this.onFinish(image.id, imageEl, timeoutId, 'success', resolve)
            }
            imageEl.src = image.url
          })
        })
        return Promise.all(imagePromises).then(imagesData => {
          return imagesData.reduce((next, imageData) => {
            next[imageData.id] = imageData
            return next
          }, {})
        })
      },
      onFinish(imageId, imageEl, timeoutId, status, resolve) {
        clearTimeout(timeoutId)
        this.timeoutIds = this.timeoutIds.filter(id => timeoutId !== id)
        resolve({
          id: imageId,
          src: imageEl.src,
          status,
          naturalWidth: imageEl.naturalWidth,
          naturalHeight: imageEl.naturalHeight,
        })
      },
      stop() {
        if (this.timeoutIds && this.timeoutIds.length) {
          this.timeoutIds.forEach(clearTimeout)
          this.timeoutIds = []
        }
      },
    },
  })
}
