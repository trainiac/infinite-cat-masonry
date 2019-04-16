/*
  Components can use the metaTags mixin to reactively manage meta tags in the head of the document.

  The component must defined a metaTags property that is a reactive list of objects representing a meta tag's
  attribute key value pairs.

  A component can optionally defined a metaTagKey property that can be used to link a component to it's meta tags
  in the document head.  By default the value is the component.$options.name value. $metaTagKey is a computed property that
  gets injected into your component that is metaTagKey, if defined, or component.$options.name if not.
*/
import { isEqual } from 'lodash/fp'

const COMPONENT_KEY_ATTR = 'data-component-key'
const SSR_ATTR = 'data-head-ssr'

/*
  Formats a string of html meta tags from a list of objects whose key value pairs are the meta tag attributes.
  "data-ssr" attribute is added when being rendered server side

  tags Array<objects>- list of objects that each represent a meta tag
   {
     property: 'og:title',
     content: 'Sweet page'
   }
  componentKey String - since meta tags are inserted into the head of the document, components need a way to track which meta tags
  they are responsible for

  return String
*/
function formatTags(tags, componentKey, isSSR) {
  return tags
    .map(tag => {
      const attrs = Object.keys(tag.attrs).map(
        attr => `${attr}="${tag.attrs[attr]}"`
      )
      attrs.push(`${COMPONENT_KEY_ATTR}=${componentKey}`)

      if (isSSR) {
        attrs.push(SSR_ATTR)
      }

      return `<${tag.name} ${attrs.join(' ')} />`
    })
    .join('')
}

/*
  Removes all nodes with the given componentKey

  componentKey String

  return undefined
*/
function removeTags(componentKey) {
  const nodes = document.querySelectorAll(
    `head [${COMPONENT_KEY_ATTR}="${componentKey}"]`
  )
  nodes.forEach(node => {
    document.head.removeChild(node)
  })
}

/*
  Inserts a list of meta tag nodes

  tags Array<objects>- list of objects that each represent a meta tag
  {
   property: 'og:title',
   content: 'Sweet page'
  }

  componentKey String

  return undefined
*/
function insertTags(tags, componentKey) {
  if (tags && tags.length) {
    document.head.insertAdjacentHTML(
      'beforeend',
      formatTags(tags, componentKey, false)
    )
  }
}

/*
  Checks to see if a component's meta tags were already rendered server side

  componentKey String

  return Boolean
*/

function hasSSRMetaTags(componentKey) {
  const ssrMetaTags = document.querySelectorAll(`head [${SSR_ATTR}]`)
  return Boolean(ssrMetaTags.length)
}

/*
  $metatTagKey is a computed property that is used both server side and client side. By default
  it is the component's name but can be overridden by defined a metaTagKey in the component.
*/
const computed = {
  computed: {
    $metaTagKey() {
      return this.metaTagKey || this.$options.name
    },
  },
}

/*
  Clients of the mixin must define a "metaTags" property that is either null or a list of objects
  representing meta tag attribute key value pais.

  The client side version of the mixin will do three things.
  1. On mount it will check to see if the meta tags of component were already rendered server side
  and if so leave them. If not, insert the meta tags defined in metaTags.
  2. If the metaTags property changes at runtime, the mixin will compare the changes and update the meta tags
  accordingly.
  3. If the component is destroyed the meta tags governed by the component will be remved.
*/
const clientMetaMixin = {
  ...computed,
  watch: {
    metaTags(newTags, oldTags) {
      if (!isEqual(newTags, oldTags)) {
        removeTags(this.$metaTagKey)
        insertTags(newTags, this.$metaTagKey)
      }
    },
  },
  mounted() {
    if (!hasSSRMetaTags(this.$metaTagKey)) {
      insertTags(this.metaTags, this.$metaTagKey)
    }
  },
  beforeDestroy() {
    removeTags(this.$metaTagKey)
  },
}

/*
  The server version of mixin simply appends meta tags, if any, to the head of the document.
*/
const serverMetaMixin = {
  ...computed,
  created() {
    const metaTags = this.metaTags
    if (metaTags) {
      this.$ssrContext.head += formatTags(metaTags, this.$metaTagKey, true)
    }
  },
}

export function objToOGMetaTags(obj) {
  return Object.keys(obj).map(key => ({
    name: 'meta',
    attrs: {
      property: `og:${key}`,
      content: obj[key],
    },
  }))
}

export function objToMetaTags(obj) {
  return Object.keys(obj).map(key => ({
    name: 'meta',
    attrs: {
      name: key,
      content: obj[key],
    },
  }))
}

export default (process.env.VUE_ENV === 'server'
  ? serverMetaMixin
  : clientMetaMixin)
