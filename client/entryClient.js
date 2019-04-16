import 'es6-object-assign/auto'
import 'es6-promise/auto'
import 'es6-string-polyfills'
import 'browser/errorHandlers.js'
import { createStore } from 'store'

// The order for importing app and router effect CSS order
import createApp from './app'
import { createRouter } from 'router'
import browserRouter from 'browser/router'

const initialState = window.__INITIAL_STATE__ // eslint-disable-line no-underscore-dangle

if (initialState.errorPage) {
  import(/* webpackChunkName: "error-app" */ './errorApp').then(mod => {
    const createErrorApp = mod.default
    const errorApp = createErrorApp(initialState)
    errorApp.$mount('#app')
  })
} else {
  const store = createStore()
  store.replaceState(initialState)
  const router = createRouter()
  const routerReady = browserRouter(store, router)
  const app = createApp(store, router)
  routerReady.then(() => {
    app.$mount('#app')
  })
}
