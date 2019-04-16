const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = options => {
  const commonStyleLoaders = [
    {
      loader: 'css-loader',
      options: {
        sourceMap: !options.optimize,
        modules: true,
        importLoaders: 3,
        localIdentName: options.optimize
          ? '[hash:base64:5]'
          : '[local]_[name]_[hash:base64:5]',
      },
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: !options.optimize,
      },
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: !options.optimize,
        includePaths: [options.paths.src],
      },
    },
    {
      loader: 'sass-resources-loader',
      options: {
        resources: [
          path.join(options.paths.src, 'styles/variables.scss'),
          path.join(options.paths.src, 'styles/mixins.scss'),
        ],
      },
    },
  ]
  const stylesLoaders = [
    {
      test: /\.(css|scss)$/,
      use: [
        {
          loader: 'vue-style-loader',
          options: {
            sourceMap: !options.optimize,
          },
        },
        ...commonStyleLoaders,
      ],
    },
  ]

  if (options.optimize) {
    stylesLoaders.unshift({
      test: /base\.scss$/,
      use: [MiniCssExtractPlugin.loader, ...commonStyleLoaders],
    })
  }

  return [
    {
      test: /\.js$/,
      exclude: file => /node_modules/.test(file) && !/\.vue\.js/.test(file),
      include: options.paths.src,
      oneOf: [
        {
          test: /client\/shared\/.*\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { modules: 'commonjs' }]],
              cacheDirectory: true,
            },
          },
        },
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { modules: false }]],
              cacheDirectory: true,
              plugins: [
                'lodash',
                [
                  '@babel/plugin-proposal-object-rest-spread',
                  { useBuiltIns: true },
                ],
                '@babel/plugin-syntax-dynamic-import',
              ],
            },
          },
        },
      ],
    },
    {
      test: /\.(css|scss)$/,
      oneOf: stylesLoaders,
    },
    {
      loader: 'url-loader',
      test: /\.(png|jpg|jpeg|gif|svg|eot|ttf|woff|woff2)$/,
      options: {
        context: options.paths.src,
        publicPath: process.env.ASSETS_URL,
        name: '[path][name].[ext]?[hash]',
        limit: 1,
      },
    },
    {
      loader: 'image-webpack-loader',
      test: /\.(gif|png|jpe?g|svg)$/i,
      options: {
        disable: !options.optimize,
      },
    },
    {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        compilerOptions: {
          preserveWhitespace: false,
        },
      },
    },
  ]
}
