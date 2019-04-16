const express = require('express')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')
const requestHandler = require('./requestHandler')
const timeout = require('connect-timeout')
const errorHandler = require('./errorHandler.js')
const utils = require('./utils')
const readFile = file => {
  return fs.readFileSync(file, 'utf-8')
}

const readJSONFile = file => {
  return JSON.parse(readFile(file))
}

module.exports = function setupProd(options) {
  const router = express.Router()
  const serverBundle = readJSONFile(options.paths.serverBundle)

  const rendererOptions = Object.assign(
    {},
    utils.getBundleRendereOptions(options),
    {
      template: readFile(options.paths.templateBuild),
      clientManifest: readJSONFile(options.paths.clientManifest),
    }
  )

  // Strip out inlined CSS
  // TODO figure out how not do it so hacky
  rendererOptions.clientManifest.initial = rendererOptions.clientManifest.initial.filter(
    asset => !asset.includes('app.css')
  )
  const globalCssIndex = rendererOptions.clientManifest.all.findIndex(asset =>
    asset.includes('app.css')
  )
  rendererOptions.clientManifest.modules = Object.keys(
    rendererOptions.clientManifest.modules
  ).reduce((next, moduleKey) => {
    const indices = rendererOptions.clientManifest.modules[moduleKey]
    next[moduleKey] = indices.filter(index => index !== globalCssIndex)
    return next
  }, {})

  const renderer = createBundleRenderer(serverBundle, rendererOptions)
  const onPageRequest = requestHandler(renderer)
  router.use(timeout('45s', { respond: true }), onPageRequest)
  router.use(errorHandler(renderer))
  return router
}
