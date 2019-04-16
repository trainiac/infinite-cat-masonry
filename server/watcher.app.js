const webpack = require('webpack')
const EventEmitter = require('events')
const { createBundleRenderer } = require('vue-server-renderer')
const createHotMiddleware = require('webpack-hot-middleware')
const createDevMiddleware = require('webpack-dev-middleware')
const MFS = require('memory-fs')
const supportsColor = require('supports-color')
const prettyjson = require('prettyjson')
const utils = require('./app/utils')
const getServerConfig = require('../config/webpack.server.config')
const getClientConfig = require('../config/webpack.client.config')

const readFile = (fs, file) => {
  return fs.readFileSync(file, 'utf-8')
}

const readJSONFile = (fs, file) => {
  return JSON.parse(readFile(fs, file))
}

module.exports = function VueDevCompiler(options) {
  console.log('Building application')
  const clientConfig = getClientConfig(options)

  if (options.verbose) {
    console.log(prettyjson.render(clientConfig))
  }

  const clientCompiler = webpack(clientConfig)

  const devMiddleware = createDevMiddleware(clientCompiler, {
    logLevel: !options.verbose ? 'silent' : 'info',
    publicPath: options.paths.publicPath,
    stats: {
      // Add asset Information
      assets: true,
      // Sort assets by a field
      //  assetsSort: "field",
      // Add information about cached (not built) modules
      cached: options.verbose,
      // Add children information
      children: options.verbose,
      // Add chunk information (setting this to `false` allows for a less verbose output)
      chunks: options.verbose,
      // Add built modules information to chunk information
      chunkModules: options.verbose,
      // Add the origins of chunks and chunk merging info
      chunkOrigins: options.verbose,
      // Sort the chunks by a field
      // chunksSort: "field",
      // Context directory for request shortening
      // context: "../src/",
      // Add errors
      errors: true,
      // Add details to errors (like resolving log)
      errorDetails: false,
      // Add the hash of the compilation
      hash: options.verbose,
      // Add built modules information
      modules: options.verbose,
      // Sort the modules by a field
      // modulesSort: "field",
      // Add public path information
      publicPath: options.verbose,
      // Add information about the reasons why modules are included
      reasons: options.verbose,
      // Add the source code of modules
      source: options.verbose,
      // Add timing information
      timings: options.verbose,
      // Add webpack version information
      version: options.verbose,
      // Add warnings
      warnings: true,

      colors: supportsColor,
    },
  })

  const hotMiddleware = createHotMiddleware(clientCompiler, {
    log: console.log,
    path: options.paths.webpackHmr,
    heartbeat: 5000,
  })

  let serverBundle, rendererOptions, renderer, buildErrors

  const emitter = new EventEmitter()

  const ready = (newServerBundle, newRenderOptions) => {
    const isFirst = !renderer
    renderer = createBundleRenderer(
      newServerBundle,
      Object.assign(
        {},
        utils.getBundleRendereOptions(options),
        newRenderOptions
      )
    )
    buildErrors = null
    emitter.emit('updated', renderer)
    if (isFirst) {
      emitter.emit('created')
    }
  }

  const errored = errors => {
    buildErrors = errors
    emitter.emit('errors', errors)
    if (!renderer) {
      emitter.emit('failed')
    }
  }

  clientCompiler.plugin('done', stats => {
    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))
    if (stats.errors.length) {
      errored(stats.errors)
      return
    }

    rendererOptions = {
      template: readFile(devMiddleware.fileSystem, options.paths.templateBuild),
    }

    rendererOptions.clientManifest = readJSONFile(
      devMiddleware.fileSystem,
      options.paths.clientManifest
    )

    if (serverBundle) {
      ready(serverBundle, rendererOptions)
    }
  })

  const serverConfig = getServerConfig(options)

  if (options.verbose) {
    console.log(prettyjson.render(serverConfig))
  }

  const serverCompiler = webpack(serverConfig)
  const mfs = new MFS()
  serverCompiler.outputFileSystem = mfs

  serverCompiler.watch({}, (err, stats) => {
    if (err) {
      throw err
    }
    stats = stats.toJson()
    if (stats.errors.length) {
      errored(stats.errors)
      return
    }

    serverBundle = readJSONFile(
      serverCompiler.outputFileSystem,
      options.paths.serverBundle
    )
    if (rendererOptions) {
      ready(serverBundle, rendererOptions)
    }
  })

  return {
    hotMiddleware,
    devMiddleware,
    emitter,
    getRenderer() {
      return renderer
    },
    getBuildErrors() {
      return buildErrors
    },
  }
}
