function interpolateParams(url, params) {
  return url
    .split('/')
    .map(part => {
      if (!part || part[0] !== ':') {
        return part
      }
      const value = encodeURIComponent(params[part.substr(1)])

      return value || part
    })
    .join('/')
}

function appendQuery(url, query) {
  if (!query) {
    return url
  }

  const hasQuery = url.indexOf('?') !== -1

  if (hasQuery) {
    const existingQuery = url.split('?')[1]
    if (existingQuery) {
      return `${url}&${query}`
    }

    return `${url}${query}`
  }

  return `${url}?${query}`
}

export function formatQuery(obj) {
  if (!obj) {
    return ''
  }

  const args = Object.keys(obj)
  args.sort()
  return args.reduce((next, arg) => {
    const value = encodeURIComponent(obj[arg])
    const pair = `${arg}=${value}`
    if (next.length) {
      return `${next}&${pair}`
    }
    return `${pair}`
  }, '')
}

export function formatUrl(url, config) {
  if (!url) {
    return url
  }

  let newUrl = url

  if (config && config.params) {
    newUrl = interpolateParams(url, config.params)
  }

  if (newUrl.indexOf('/:') !== -1) {
    let message = `Url is missing params. url=${newUrl}`
    if (config) {
      message = `${message}, config=${JSON.stringify(config)}`
    }
    throw new Error(message)
  }

  const query = formatQuery(config.query)
  newUrl = appendQuery(newUrl, query)
  return newUrl
}
