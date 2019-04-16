const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')
const getBaseConfig = require('./webpack.base.config')
const stringifyValues = require('./utils').stringifyValues

module.exports = function getConfig(options) {
  return merge(getBaseConfig(options), {
    entry: path.join(options.paths.src, 'entryServer.js'),
    target: 'node',
    externals: nodeExternals({
      whitelist: [/\.css$/, /\?vue&type=style/],
    }),
    output: {
      filename: 'server-bundle.js',
      libraryTarget: 'commonjs2',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': stringifyValues({
          VUE_ENV: 'server',
        }),
      }),
      new VueSSRServerPlugin({
        filename: `../${options.paths.serverBundleName}`,
      }),
    ],
    optimization: {
      splitChunks: false,
    },
  })
}
