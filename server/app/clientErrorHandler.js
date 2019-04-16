const HttpStatus = require('http-status-codes')
const headers = require('./headers')
const utils = require('./utils')

const ErrorProperties = {
  [HttpStatus.NOT_FOUND]: {
    title: 'Not Found',
    errorType: 'notFound',
  },
  [HttpStatus.GONE]: {
    title: 'Gone',
    errorType: 'gone',
  },
  general: {
    title: 'Client Error',
    errorType: 'clientError',
  },
}

module.exports = function handleClientError(err, req, res, next, renderer) {
  const errorProps =
    ErrorProperties[err.responseCode] || ErrorProperties.general
  const errorContext = {
    errorPage: true,
    errorType: errorProps.errorType,
    title: errorProps.title,
    // only support english for now
    lang: 'en',
  }

  utils.extendRequestContext(errorContext)

  renderer.renderToString(errorContext, (renderErr, html) => {
    if (renderErr) {
      next(renderErr)
    }
    res.set(headers.HtmlResponseHeaders)
    res.status(err.responseCode).send(html)
  })
}
