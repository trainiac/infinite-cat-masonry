const base = {}

const serverParams = {
  PORT: 3005,
}

const buildParams = {
  ASSETS_URL: '/static/',
}

const server = Object.assign({}, base, serverParams)
const build = Object.assign({}, base, buildParams)
const dev = Object.assign({}, server, buildParams)

module.exports = {
  server,
  build,
  dev,
}
