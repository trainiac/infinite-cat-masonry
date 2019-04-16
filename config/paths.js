const path = require('path')
const base = path.resolve(__dirname, '..')
const src = path.join(base, 'client')
const build = path.join(base, 'build')
const serverBundleName = 'vue-ssr-server-bundle.json'
const clientManifestName = 'vue-ssr-client-manifest.json'
module.exports = {
  base,
  src,
  build,
  staticOutput: path.join(build, 'static/'),
  publicPath: '/static/',
  templateSrc: path.join(src, 'index.html'),
  webpackHmr: '/__webpack_hmr',
  templateBuild: path.join(build, 'index.html'),
  serverBundleName,
  clientManifestName,
  serverBundle: path.join(build, serverBundleName),
  clientManifest: path.join(build, clientManifestName),
}
