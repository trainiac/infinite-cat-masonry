import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from 'router/routes'

Vue.use(VueRouter)

export function createRouter() {
  const router = new VueRouter({
    routes,
    mode: 'history',
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }

      return { x: 0, y: 0 } // eslint-disable-line id-length
    },
  })

  return router
}
