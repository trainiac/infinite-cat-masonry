const webpack = require('webpack')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const rimraf = require('rimraf')
const supportsColor = require('supports-color')
const prettyjson = require('prettyjson')
const minimist = require('minimist')
const processBuildEnv = require('../config/utils').processBuildEnv
const getClientConfig = require('../config/webpack.client.config.js')
const getServerConfig = require('../config/webpack.server.config.js')

function runCompiler(config, options) {
  const webpackStats = {
    colors: supportsColor,
  }

  Object.assign(webpackStats, {
    children: options.verbose,
    chunks: options.verbose,
    chunkModules: options.verbose,
    chunkOrigins: options.verbose,
    reasons: options.verbose,
    depth: options.verbose,
    entrypoints: options.verbose,
    usedExports: options.verbose,
    providedExports: options.verbose,
    errors: true,
    errorDetails: options.verbose,
    maxModules: options.verbose ? Infinity : 15, // eslint-disable-line no-magic-numbers
    exclude: undefined,
    modules: options.verbose,
    cached: options.verbose,
    cachedAssets: options.verbose,
    optimizationBailout: options.verbose,
  })

  const compiler = webpack(config)
  compiler.apply(new ProgressPlugin())

  return new Promise((resolve, reject) => {
    compiler.run(function compilerCallback(err, stats) {
      if (err) {
        compiler.purgeInputFileSystem()
        console.error(err.stack || err)
        if (err.details) {
          console.error(err.details)
        }

        reject(err)
      }

      process.stdout.write(`${stats.toString(webpackStats)}\n`)
      const hasErrors = stats.hasErrors()
      if (hasErrors) {
        reject(new Error('build has errors'))
      } else {
        resolve()
      }
    })
  })
}

const args = minimist(process.argv.slice(2))

/*
  --env to set an environment (for local development only)
  --verbose for more logging output
  --analyze to analyze output
*/

const options = processBuildEnv(args)
const clientConfig = getClientConfig(options)

if (options.verbose) {
  console.log(prettyjson.render(clientConfig))
}

rimraf.sync(options.paths.build)

runCompiler(clientConfig, options).catch(() => {
  process.exit(1)
})

const serverConfig = getServerConfig(options)
if (options.verbose) {
  console.log(prettyjson.render(serverConfig))
}
runCompiler(serverConfig, options).catch(() => {
  process.exit(1)
})
