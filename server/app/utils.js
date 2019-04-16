const errorRange = 500
const unsuccessfulRange = 300
const firstScript = /<script src="[^"]*" defer><\/script>/

const getLevel = (req, res) => {
  if (res.statusCode >= errorRange) {
    return 'error'
  }

  if (res.statusCode >= unsuccessfulRange) {
    return 'warn'
  }

  return 'stat'
}

const getBundleRendereOptions = options => {
  return {
    runInNewContext: false,
    shouldPreload: () => false,
    shouldPrefetch: () => false,
    basedir: options.paths.build,
    inject: false,
  }
}

const extendRequestContext = context => {
  context.renderScriptsNoRuntime = () => {
    const scripts = context.renderScripts(context)
    if (process.env.NODE_ENV === 'production') {
      return scripts.replace(firstScript, '')
    }
    return scripts
  }
}

module.exports = {
  getLevel,
  getBundleRendereOptions,
  extendRequestContext,
}
