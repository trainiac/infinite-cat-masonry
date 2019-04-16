const syntax = require('postcss-scss')

module.exports = () => {
  const plugins = [
    {
      mod: require('autoprefixer'),
    },
    {
      mod: require('postcss-flexbugs-fixes'),
    },
  ]

  if (process.env.NODE_ENV === 'production') {
    plugins.push({
      options: {
        preset: [
          'default',
          {
            discardComments: { removeAll: true },
            mergeLonghand: false,
          },
        ],
      },
      mod: require('cssnano'),
    })
  }

  return {
    sourceMap: process.env.NODE_ENV !== 'production',
    parser: syntax,
    plugins: plugins.map(plugin => {
      if (plugin.options) {
        return plugin.mod(plugin.options)
      }

      return plugin.mod()
    }),
  }
}
