<template>
  <div :class="$style.container" :style="{ width: `${colWidth}px` }">
    <div
      v-for="item in items"
      :key="item.itemId"
      :ref="item.itemId"
      :style="{
        transform: `translateX(0px) translateY(0px)`,
        width: `${colWidth}px`,
      }"
    >
      <slot
        :item="item.item"
        :placement="{ width: colWidth, top: 0, left: 0 }"
      />
    </div>
  </div>
</template>

<script>
import { round } from 'utils/math'
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    colWidth: {
      type: Number,
      required: true,
    },
    colSpace: {
      type: Number,
      required: true,
    },
    colCount: {
      type: Number,
      required: true,
    },
    columnHeights: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.measureItems()
  },
  methods: {
    measureItems() {
      const placements = {}
      const columnHeights = [...this.columnHeights]
      this.items.forEach(item => {
        const itemId = item.itemId
        const itemHeight = this.$refs[itemId][0].getBoundingClientRect().height
        const shortestColumn = this.getShortestColumn(columnHeights)
        placements[itemId] = {
          top: shortestColumn.height,
          left: shortestColumn.colIndex * (this.colWidth + this.colSpace),
          height: itemHeight,
          width: this.colWidth,
        }
        columnHeights[shortestColumn.colIndex] = round(
          itemHeight + this.colSpace + columnHeights[shortestColumn.colIndex]
        )
      })
      this.$emit('measureItems', {
        placements,
        height: this.getTallestColumn(columnHeights),
        columnHeights,
      })
    },
    getShortestColumn(columnHeights) {
      let shortestColumn
      columnHeights.forEach((height, colIndex) => {
        if (colIndex === 0) {
          shortestColumn = {
            height,
            colIndex,
          }
        } else if (height < shortestColumn.height) {
          shortestColumn = {
            height,
            colIndex,
          }
        }
      })
      return shortestColumn
    },
    getTallestColumn(columnHeights) {
      let tallestColumn
      columnHeights.forEach((height, colIndex) => {
        if (colIndex === 0) {
          tallestColumn = {
            height,
            colIndex,
          }
        } else if (height > tallestColumn.height) {
          tallestColumn = {
            height,
            colIndex,
          }
        }
      })
      return tallestColumn.height
    },
  },
}
</script>

<style lang="scss" module>
.container {
  position: absolute !important;
  height: 1px !important;
  width: 1px !important;
  overflow: hidden !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
}
</style>
