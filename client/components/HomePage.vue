<template>
  <div :class="$style.container">
    <InfiniteLoader
      :activate="activate"
      :continueLoading="true"
      @requestMore="fetchPage"
    >
      <Masonry :items="items" :layout="$options.constants.layout">
        <template #tile="{ item, placement }">
          <Photo
            :image="item.image"
            :containerWidth="placement.width"
            @imageClick="onImageClick"
          />
        </template>
      </Masonry>
    </InfiniteLoader>
    <LightBox
      v-if="lightBoxProps"
      v-bind="lightBoxProps"
      @requestClose="lightBoxProps = null"
    />
  </div>
</template>

<script>
import imageLoader from 'browser/imageLoader'
import InfiniteLoader from 'components/InfiniteLoader'
import LightBox from 'components/LightBox'
import Masonry from 'components/Masonry'
import Photo from 'components/Photo'
import CatApi from 'api/cat'
const pageSize = 9

export default {
  components: {
    InfiniteLoader,
    Masonry,
    LightBox,
    Photo,
  },
  constants: {
    layout: [
      {
        width: 600,
        colSpace: 10,
        cols: 1,
      },
      {
        width: 890,
        colSpace: 20,
        cols: 2,
      },
      {
        width: 1280,
        colSpace: 20,
        cols: 3,
      },
      {
        width: 1600,
        colSpace: 20,
        cols: 4,
      },
      {
        width: Infinity,
        colSpace: 20,
        cols: 5,
      },
    ],
  },
  data() {
    return {
      activate: true,
      items: [],
      lightBoxProps: null,
      page: 0,
    }
  },
  created() {
    this.imageLoader = imageLoader({
      timeout: 2000,
    })
  },
  beforeDestroy() {
    this.imageLoader.$destroy()
  },
  methods: {
    prepareForMasonry(newCats) {
      if (newCats.length) {
        const images = newCats.reduce((next, newCat) => {
          next.push({
            id: newCat.id,
            url: newCat.url,
          })

          return next
        }, [])
        this.imageLoader.loadImages(images).then(imageData => {
          const newItems = newCats.map((newCat, index) => ({
            itemId: newCat.id,
            item: {
              image: imageData[newCat.id],
            },
          }))
          this.items = this.items.concat(newItems)
          this.activate = true
        })
      }
    },
    fetchPage() {
      this.activate = false
      this.page += 1
      return CatApi.get('/v1/images/search', {
        params: {
          limit: pageSize,
          page: this.page,
          order: 'DESC',
        },
      }).then(response => {
        this.prepareForMasonry(response.data)
      })
    },
    onImageClick({ altMessage, imageUrl, targetRect }) {
      if (this.lightBoxProps) {
        return
      }
      this.lightBoxProps = {
        altMessage,
        imageUrl,
        targetRect: {
          x: targetRect.x, // eslint-disable-line id-length
          y: targetRect.y, // eslint-disable-line id-length
          width: targetRect.width,
          height: targetRect.height,
        },
      }
    },
  },
}
</script>

<style lang="scss" module>
.container {
  padding: 20px;
}
</style>
