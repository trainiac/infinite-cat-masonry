const express = require('express')
const pagesLogging = require('./pagesLogging')
module.exports = (options, appWatcher) => {
  const router = express.Router()
  if (!options.optimize) {
    router.use(pagesLogging.request())
  }

  router.use(pagesLogging.response())

  // html request handlers
  if (options.optimize) {
    const prodRouter = require('./router.prod.js')(options)
    router.use(prodRouter)
  } else {
    const devRouter = require('./router.dev.js')(options, appWatcher)
    router.use(devRouter)
  }
  return router
}
