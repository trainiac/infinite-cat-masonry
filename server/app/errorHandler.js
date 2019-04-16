const HttpStatus = require('http-status-codes')
const headers = require('./headers')
const TError = require('../../client/shared/TError')
const logger = require('../../client/shared/logger')
const utils = require('./utils')

module.exports = renderer => {
  return (err, req, res, next) => {
    const wrappedError = new TError('Uncaught server exception', {
      name: 'UncaughtServerExceptionError',
      cause: err,
      info: {},
    })

    if (res.headersSent) {
      next(wrappedError)
    } else {
      logger(TError.toLog(wrappedError), req.hostname)
      const status =
        err.name === 'ServiceUnavailableError'
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.INTERNAL_SERVER_ERROR

      const errorContext = {
        errorPage: true,
        title: 'Error',
        lang: req.userLocale.split('-')[0],
      }
      utils.extendRequestContext(errorContext)
      renderer.renderToString(errorContext, (renderErr, html) => {
        if (renderErr) {
          next(renderErr)
        }

        res.set(headers.HtmlResponseHeaders)
        res.status(status).send(html)
      })
    }
  }
}
