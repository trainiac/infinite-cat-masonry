const express = require('express')
const requestHandler = require('./requestHandler')
const timeout = require('connect-timeout')
const escapeHtml = require('escape-html')
const errorHandler = require('./errorHandler.js')

module.exports = function setupDev(options, appWatcher) {
  const router = express.Router()

  const cachedRenderer = appWatcher.getRenderer()
  let buildErrors = appWatcher.getBuildErrors()
  let pageRequestHandler
  let currentRenderer
  if (cachedRenderer) {
    currentRenderer = cachedRenderer
    pageRequestHandler = requestHandler(cachedRenderer)
  }

  appWatcher.emitter.removeAllListeners('updated')
  appWatcher.emitter.on('updated', renderer => {
    currentRenderer = renderer
    pageRequestHandler = requestHandler(renderer)
    buildErrors = null
    console.log('updated renderer')
  })

  appWatcher.emitter.removeAllListeners('errors')
  appWatcher.emitter.on('errors', errors => {
    // only show build errors until a page request
    // handler is ready. Then it will display the errors
    if (!pageRequestHandler) {
      buildErrors = errors
    } else {
      appWatcher.emitter.removeAllListeners('errors')
    }
  })

  router.use(timeout('45s', { respond: true }), (req, res, next) => {
    if (!req.url.startsWith(options.paths.publicPath)) {
      if (buildErrors) {
        res.send(`<pre>${escapeHtml(buildErrors.join('\n'))}</pre>`)
      } else if (!pageRequestHandler) {
        res.send('Waiting for app to build...')
      } else {
        pageRequestHandler(req, res, next)
      }
    } else {
      console.log('request ignored', req.url)
      res.send('')
    }
  })

  router.use((err, req, res, next) => {
    errorHandler(currentRenderer)(err, req, res, next)
  })

  return router
}
