import Vue from 'vue'
import 'styles/base.scss'
import App from 'components/App'
import Plugins from 'plugins'

Vue.use(Plugins)

export default function createApp(store, router) {
  return new Vue({
    name: 'Root',
    render: createElement => {
      return createElement(App)
    },
    store,
    router,
  })
}
