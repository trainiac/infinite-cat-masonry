<template>
  <div>
    <div :class="$style.container" :style="{ height: `${height}px` }">
      <div
        v-for="item in measuredItems"
        :key="item.itemId"
        :ref="`display-${item.itemId}`"
        :style="{
          transform: `translateX(${
            placements[item.itemId].left
          }px) translateY(${placements[item.itemId].top}px)`,
          width: `${placements[item.itemId].width}px`,
        }"
        :class="$style.item"
      >
        <slot
          name="tile"
          :item="item.item"
          :placement="placements[item.itemId]"
        />
      </div>
    </div>
    <MasonryMeasure
      v-if="unmeasuredItems.length"
      :items="unmeasuredItems"
      :colWidth="colWidth"
      :colSpace="colSpace"
      :colCount="colCount"
      :columnHeights="columnHeights"
      @measureItems="onMeasureItems"
    >
      <template #default="{ item, placement }">
        <slot name="tile" :item="item" :placement="placement" />
      </template>
    </MasonryMeasure>
    <MasonryMeasure
      v-if="resizedItems.length"
      :items="resizedItems"
      :colWidth="colWidth"
      :colSpace="colSpace"
      :colCount="colCount"
      :columnHeights="columnHeights"
      @measureItems="onMeasureResizedItems"
    >
      <template #default="{ item, placement }">
        <slot name="tile" :item="item" :placement="placement" />
      </template>
    </MasonryMeasure>
  </div>
</template>

<script>
import { round } from 'utils/math'
import { debounce } from 'utils/lang'
import { times } from 'utils/arr'
import MasonryMeasure from 'components/MasonryMeasure'
const resizeDebounceTime = 200
export default {
  components: {
    MasonryMeasure,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
    itemsKey: {
      type: String,
      required: false,
    },
    layout: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      // since masonry is absolute we need to always set the container height
      // to the height of the talles column
      height: 0,
      // ready items are items that have had a placement calculated and
      // are then used to iterate over to generate the final layer
      measuredItems: [],
      unmeasuredItems: [],
      resizedItems: [],
      colSpace: 0,
      colWidth: 0,
      colCount: 0,
    }
  },
  watch: {
    itemsKey() {
      this.reset()
    },
    layout() {
      this.calcCols()
      this.resizedItems = this.measuredItems
    },
    items() {
      const unmeasuredItems = this.getUnmeasuredItems()
      if (unmeasuredItems.length) {
        this.unmeasuredItems = this.getUnmeasuredItems()
      }
    },
  },
  created() {
    this.placements = {}
  },
  mounted() {
    this.debouncedOnResize = debounce(
      this.onResize.bind(this),
      resizeDebounceTime
    )
    window.addEventListener('resize', this.debouncedOnResize)
    this.calcCols()
    this.unmeasuredItems = this.getUnmeasuredItems()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.debouncedOnResize)
  },
  methods: {
    getUnmeasuredItems() {
      return this.items.slice(this.measuredItems.length)
    },
    reset() {
      this.height = 0
      this.placements = {}
      this.unmeasuredItems = []
      this.resizedItems = []
      this.measuredItems = []
    },
    calcCols() {
      this.width = this.$el.getBoundingClientRect().width
      const breakpoint = this.layout.find(bp => bp.width >= this.width)
      this.colSpace = breakpoint.colSpace
      this.colCount = breakpoint.cols
      this.colWidth = round(
        (this.width - (this.colCount - 1) * this.colSpace) / this.colCount,
        0
      )
      const columnHeights = []
      times(() => columnHeights.push(0), this.colCount)
      this.columnHeights = columnHeights
    },
    onResize() {
      const width = this.$el.getBoundingClientRect().width
      if (this.width === width || !this.measuredItems.length) {
        return
      }
      this.calcCols()
      this.resizedItems = this.measuredItems
    },
    onMeasureResizedItems({ placements, height, columnHeights }) {
      this.placements = placements
      this.height = height
      this.resizedItems = []
      this.columnHeights = columnHeights
    },
    onMeasureItems({ placements, height, columnHeights }) {
      this.placements = {
        ...this.placements,
        ...placements,
      }
      this.height = height
      this.measuredItems = this.measuredItems.concat(this.unmeasuredItems)
      this.unmeasuredItems = []
      this.columnHeights = columnHeights
    },
  },
}
</script>

<style module>
.container {
  position: relative;
  overflow: hidden;
}
.item {
  position: absolute;
  transition: all 0.2s;
}
</style>
