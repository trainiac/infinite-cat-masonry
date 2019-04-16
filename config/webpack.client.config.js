const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HTMLInlineCSSWebpackPlugin = require('@trainiac/html-inline-css-webpack-plugin')
  .default
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const baseConfig = require('./webpack.base.config')
const configUtils = require('./utils')
const stringifyValues = configUtils.stringifyValues

function getPlugins(options) {
  const htmlConfig = {
    filename: options.paths.templateBuild,
    template: options.paths.templateSrc,
    inject: false,
    optimize: options.optimize,
    faviconPath: '/favicon.ico',
  }

  const plugins = [
    new webpack.DefinePlugin({
      'process.env': stringifyValues({
        VUE_ENV: 'client',
      }),
    }),
    new HtmlWebpackPlugin(htmlConfig),
  ]

  if (options.optimize) {
    plugins.push(new InlineManifestWebpackPlugin())
    plugins.push(new HTMLInlineCSSWebpackPlugin())
  }

  plugins.push(
    new VueSSRClientPlugin({
      filename: `../${options.paths.clientManifestName}`,
    })
  )

  if (!options.optimize) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }

  if (options.analyze) {
    plugins.push(new BundleAnalyzerPlugin())
  }

  return plugins
}

module.exports = function getConfig(options) {
  const output = {}
  if (!options.optimize) {
    output.filename = '[name].js'
  }

  const config = merge(baseConfig(options), {
    devtool: options.optimize ? false : '#cheap-module-source-map',
    entry: {
      app: [path.join(options.paths.src, 'entryClient.js')],
    },
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        maxAsyncRequests: 1,
      },
    },
    output,
    plugins: getPlugins(options),
  })

  if (!options.optimize) {
    config.entry.app = [
      'eventsource-polyfill',
      `webpack-hot-middleware/client?path=${
        options.paths.webpackHmr
      }&overlay=false&reload=true`,
      ...config.entry.app,
    ]
  }

  return config
}
