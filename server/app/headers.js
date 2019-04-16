// TODO Content-Security-Policy, Strict-Transport-Security, Public-Key-Pins, CSRF

const NoCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
}

const HtmlResponseHeaders = Object.assign({}, NoCacheHeaders, {
  'Content-Type': 'text/html',
  'X-Frame-Options': 'DENY',
  'X-Download-Options': 'noopen',
  'X-Content-Type-Options': 'nosniff',
})

module.exports = {
  HtmlResponseHeaders,
  NoCacheHeaders,
}
