const HttpStatus = require('http-status-codes')
const headers = require('./headers')

module.exports = function handleRedirectError(err, res, context) {
  let responseHeaders = {}
  if (context.responseHeaders) {
    responseHeaders = Object.assign(
      {},
      responseHeaders,
      context.responseHeaders
    )
  }
  if (err.responseCode === HttpStatus.MOVED_TEMPORARILY) {
    responseHeaders = Object.assign({}, responseHeaders, headers.NoCacheHeaders)
  }
  res.set(responseHeaders)
  res.redirect(err.responseCode, err.location)
}
