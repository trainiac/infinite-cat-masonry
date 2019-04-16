<template>
  <div :class="$style.container">
    <figure
      :style="{
        height: `${imageHeight}px`,
      }"
      :class="$style.figure"
    >
      <img alt="Cat Photo" :src="imageUrl" @click="onImageClick" />
    </figure>
  </div>
</template>

<script>
import { round } from 'utils/math'
export default {
  props: {
    image: {
      type: Object,
      required: true,
    },
    containerWidth: {
      type: Number,
      required: true,
    },
  },
  computed: {
    imageUrl() {
      return this.image.src
    },
    imageHeight() {
      if (this.image.naturalHeight) {
        return this.scaleHeight(
          this.image.naturalHeight,
          this.image.naturalWidth,
          this.containerWidth
        )
      }
      return this.containerWidth
    },
  },
  methods: {
    scaleHeight(naturalHeight, naturalWidth, width) {
      if (naturalWidth < width) {
        return naturalHeight
      }
      return round(width / naturalWidth) * naturalHeight
    },
    onImageClick(e) {
      const targetRect = e.target.getBoundingClientRect()
      this.$emit('imageClick', {
        targetRect,
        altMessage: 'Cat Photo',
        imageUrl: this.image.src,
      })
    },
  },
}
</script>

<style lang="scss" module>
.container {
  box-shadow: 0 1px 2px rgba(60, 60, 60, 0.2);
  color: #4a4a4a;
  border-radius: 3px;
  position: relative; // for zIndex over placeholder
}

.figure {
  margin: 0;
  transition: all 0.2s;
  text-align: center;
  @media #{$isAboveMobile} {
    min-height: 150px;
  }
  img {
    transition: all 0.2s;
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;
    max-height: 100%;
    max-width: 100%;
    position: relative;
    cursor: pointer;
  }
}
</style>
