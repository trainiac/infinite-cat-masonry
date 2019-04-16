import { NOT_FOUND, MOVED_TEMPORARILY } from 'http-status-codes'
import { createStore } from 'store'
import { createRouter } from 'router'
import createApp from './app'
import createErrorApp from './errorApp'
import { beforeRoute, confirmedRoute } from 'router/hooks'
const TError = require('shared/TError')
const logger = require('shared/logger')

export default context => {
  context.head = ''
  if (context.errorPage) {
    context.state = {
      errorPage: true,
      errorType: context.errorType,
    }
    return Promise.resolve(createErrorApp(context.state))
  }

  const store = createStore({
    request: context.request,
  })
  const router = createRouter()
  const app = createApp(store, router)
  router.beforeEach((to, from, next) => {
    if (to.meta.notFound) {
      const error = new Error('Route not found')
      error.responseCode = NOT_FOUND
      next(error)
    } else {
      beforeRoute(store, to, from, context)
        .then(() => {
          next()
        })
        .catch(err => {
          next(err)
        })
    }
  })

  return new Promise((resolve, reject) => {
    router.onError(reject)
    router.onReady(resolve, reject)
    router.push(context.url)
  })
    .then(() => {
      context.asyncDataStart = Date.now()
      logger({
        level: 'stat',
        category: 'PageRouteResolved',
        info: {
          duration: context.asyncDataStart - context.startRequest,
        },
      })

      const currentRoute = router.currentRoute
      return confirmedRoute(store, currentRoute, { matched: [] })
    })
    .then(() => {
      context.rendered = () => {
        context.state = store.state
      }
      context.renderStart = Date.now()
      logger({
        level: 'stat',
        category: 'PageDataResolved',
        info: {
          duration: context.renderStart - context.asyncDataStart,
        },
      })

      return app
    })
    .catch(err => {
      if (err.redirect) {
        if (err.redirect.url) {
          err.location = err.redirect.url
        } else {
          err.location = router.resolve(err.redirect).href
        }
        err.responseCode = MOVED_TEMPORARILY
      }

      if (err.responseCode) {
        return Promise.reject(err)
      }

      const wrappedError = new TError('An error occured while loading url', {
        name: 'LoadUrlError',
        cause: err,
      })

      return Promise.reject(wrappedError)
    })
}
