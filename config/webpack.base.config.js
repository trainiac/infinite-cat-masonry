const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const TerserPlugin = require('terser-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const rulesConfig = require('./webpack.rules.config')
const configUtils = require('./utils')
const stringifyValues = configUtils.stringifyValues

module.exports = function getConfig(options) {
  const config = {
    mode: options.optimize ? 'production' : 'development',
    output: {
      path: options.paths.staticOutput,
      filename: options.optimize ? '[chunkhash].js' : '[name].js',
      publicPath: process.env.ASSETS_URL,
    },
    performance: {
      hints: options.optimize ? 'warning' : false,
    },
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      modules: [options.paths.src, 'node_modules'],
    },
    module: {
      rules: rulesConfig(options),
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          sourceMap: !options.optimize,
          terserOptions: {
            warnings: options.verbose,
            compress: {
              drop_console: true, // eslint-disable-line camelcase
              warnings: options.verbose,
            },
          },
        }),
      ],
    },
  }

  let plugins = [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': stringifyValues({
        NODE_ENV: process.env.NODE_ENV,
      }),
    }),
  ]

  if (options.optimize) {
    plugins = plugins.concat([
      new LodashModuleReplacementPlugin({
        currying: true,
        flattening: true,
        placeholders: true,
      }),
      new webpack.HashedModuleIdsPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ])
  }

  config.plugins = plugins

  return config
}
