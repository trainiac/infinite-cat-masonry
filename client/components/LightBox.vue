<template>
  <div>
    <div :class="$style.mask" :style="maskStyles" @click="onClose" />
    <img
      ref="img"
      :src="imageUrl"
      :alt="altMessage"
      :style="imageStyles"
      :class="$style.image"
      @load="onImageLoad"
    />
  </div>
</template>

<script>
import { round } from 'utils/math'
import mediaQuery from 'browser/mediaQuery'
const imageTransition = 'opacity 0.2s, transform 0.2s'
const Paddings = {
  mobile: 30,
  tablet: 50,
  desktop: 70,
  large: 100,
}
const Delays = {
  closeAnimation: 200,
  openAnimationSetup: 50,
}
export default {
  props: {
    imageUrl: {
      type: String,
      required: true,
    },
    altMessage: {
      type: String,
      required: true,
    },
    targetRect: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      maskStyles: {},
      imageStyles: {},
    }
  },
  methods: {
    getPadding() {
      if (mediaQuery.belowMobile()) {
        return Paddings.mobile
      }

      if (mediaQuery.belowTablet()) {
        return Paddings.tablet
      }

      if (mediaQuery.belowDesktop()) {
        return Paddings.desktop
      }

      return Paddings.large
    },
    onClose(event) {
      this.imageStyles = {
        transition: imageTransition,
        ...this.getClosedImageStyles(),
      }
      this.closeMask()
      setTimeout(() => {
        this.$emit('requestClose')
      }, Delays.closeAnimation)
    },
    openMask() {
      this.maskStyles = {
        opacity: 0.5,
      }
    },
    closeMask() {
      this.maskStyles = {}
    },
    getClosedImageStyles() {
      const image = this.$refs.img
      const scaleX = round(this.targetRect.width / image.naturalWidth, 2)
      const scaleY = round(this.targetRect.height / image.naturalHeight, 2)

      return {
        transform: `translateX(${this.targetRect.x}px) translateY(${
          this.targetRect.y
        }px) scale(${scaleX}, ${scaleY})`,
      }
    },
    getOpenImageStyles() {
      const image = this.$refs.img
      const screenWidth = window.innerWidth
      const screenHeight = window.innerHeight
      const imageHeight = image.naturalHeight
      const imageWidth = image.naturalWidth
      const padding = this.getPadding()
      const availableWidth = screenWidth - 2 * padding
      const availableHeight = screenHeight - 2 * padding
      let scaleX = 1
      let scaleY = 1
      if (imageWidth > availableWidth) {
        scaleX = round(availableWidth / imageWidth, 2)
      }

      if (imageHeight > availableHeight) {
        scaleY = round(availableHeight / imageHeight, 2)
      }

      if (scaleX < scaleY) {
        scaleY = scaleX
      } else if (scaleY < scaleX) {
        scaleX = scaleY
      }

      const newHeight = scaleY * imageHeight
      const newWidth = scaleX * imageWidth

      const top = round(screenHeight / 2, 2) - round(newHeight / 2, 2)
      const left = round(screenWidth / 2, 2) - round(newWidth / 2, 2)
      return {
        transition: imageTransition,
        opacity: 1,
        transform: `translateX(${left}px) translateY(${top}px) scale(${scaleX}, ${scaleY})`,
      }
    },
    onImageLoad() {
      this.imageStyles = this.getClosedImageStyles()
      setTimeout(() => {
        this.imageStyles = this.getOpenImageStyles()
        this.openMask()
      }, Delays.openAnimationSetup)
    },
  },
}
</script>

<style lang="scss" module>
.mask {
  transition: opacity 0.2s;
  position: fixed;
  z-index: 99999999;
  top: 0;
  left: 0;
  background-color: #000;
  opacity: 0;
  height: 100vh;
  width: 100vw;
  cursor: pointer;
}

.image {
  transform-origin: top left;
  position: fixed;
  top: 0;
  left: 0;
  opacity: 0;
  z-index: 999999999;
  border-radius: 6px;
}
</style>
