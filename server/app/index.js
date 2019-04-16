const express = require('express')
const staticHandlers = require('./static')
const pagesRouter = require('./pages')

module.exports = function App(options, appWatcher) {
  const router = express.Router()
  router.get('/favicon.ico', staticHandlers.serverStaticCache(options))
  router.use(options.paths.publicPath, staticHandlers.general(options))
  if (!options.optimize) {
    router.use(appWatcher.devMiddleware)
    router.use(appWatcher.hotMiddleware)
  }
  router.get('*', pagesRouter(options, appWatcher))
  return router
}
