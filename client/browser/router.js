import {
  beforeRoute,
  confirmedRoute,
  afterRoute,
  registerRouteVuexModules,
} from 'router/hooks'
import { NOT_FOUND } from 'http-status-codes'
const logger = require('shared/logger')
const TError = require('shared/TError')

function logPageView(store, isFirstPageView) {
  logger({
    level: 'stat',
    category: 'PageView',
    info: {
      isFirstPage: isFirstPageView,
    },
  })
}

export default (store, router) => {
  logPageView(store, true)
  router.onError(err => {
    if (err.redirect) {
      router.push(err.redirect)
      return
    }

    let wrappedError
    if (err.name === 'Error' && err.message.startsWith('Loading chunk')) {
      wrappedError = new TError(
        'There was an error downloading a route chunk',
        {
          name: 'LoadingRouteChunkError',
          cause: err,
        }
      )
    } else {
      wrappedError = new TError('There was an error routing', {
        name: 'RouterResolutionError',
        cause: err,
      })
    }

    logger(TError.toLog(wrappedError))
  })

  return new Promise(resolve => {
    router.onReady(resolve)
  })
    .then(() => {
      router.currentRoute.meta.isFirstRoute = true
      return registerRouteVuexModules(store, router.currentRoute)
    })
    .then(() => {
      router.beforeEach((to, from, next) => {
        if (to.meta.notFound) {
          window.location = to.fullPath
        } else {
          beforeRoute(store, to, from)
            .then(() => {
              next()
            })
            .catch(err => {
              if (err.responseCode === NOT_FOUND) {
                // Server side allows us to keep a url
                // such as /foo/123 when foo id 123 does not exist
                // but still render a 404 page.
                // Doing this client side is difficult. So we reload
                // The 404 route and let the server do the work
                window.location = to.fullPath
              } else if (err.redirect) {
                if (router.resolve(err.redirect.url).resolved.meta.notFound) {
                  window.location = err.redirect.url
                } else {
                  next(err.redirect.url)
                }
              } else if (err.cancel) {
                next(false)
              } else {
                next(err)
              }
            })
        }
      })

      router.beforeResolve((to, from, next) => {
        logPageView(store, false)
        confirmedRoute(store, to, from).catch(err => {
          logger(TError.toLog(err))
        })

        next()
      })

      router.afterEach((to, from) => {
        afterRoute(store, to, from)
      })
    })
}
