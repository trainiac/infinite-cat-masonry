const HttpStatus = require('http-status-codes')
const headers = require('./headers')
const logger = require('../../client/shared/logger')
const utils = require('./utils')
const redirectHandler = require('./redirectHandler')
const clientErrorHandler = require('./clientErrorHandler')

module.exports = renderer => (req, res, next) => {
  const context = {
    title: 'App Title', // default title
    url: req.url,
    lang: 'en',
    startRequest: Date.now(),
  }

  utils.extendRequestContext(context)

  renderer.renderToString(context, (err, html) => {
    // eslint-disable-line consistent-return
    if (err) {
      if (
        err.responseCode >= HttpStatus.MULTIPLE_CHOICES &&
        err.responseCode < HttpStatus.BAD_REQUEST
      ) {
        redirectHandler(err, res, context)
      } else if (
        err.responseCode >= HttpStatus.BAD_REQUEST &&
        err.responseCode < HttpStatus.INTERNAL_SERVER_ERROR
      ) {
        clientErrorHandler(err, req, res, next, renderer)
      } else {
        next(err)
      }
      return
    }

    logger(
      {
        level: 'stat',
        category: 'PageRenderCompleted',
        info: {
          duration: Date.now() - context.renderStart,
        },
      },
      req.hostname
    )

    if (req.timedout) {
      // If request timedout a response was already sent
      // via the error handler
      logger(
        {
          level: 'error',
          category: 'RendererFinishedAfterTimeout',
        },
        req.hostname
      )
      return
    }

    let responseHeaders = headers.HtmlResponseHeaders
    if (context.responseHeaders) {
      responseHeaders = Object.assign(
        {},
        responseHeaders,
        context.responseHeaders
      )
    }

    res.set(responseHeaders)
    res.send(html)
  })
}
