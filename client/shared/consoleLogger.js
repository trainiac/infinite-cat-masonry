const TError = require('./TError')

const levels = {
  error: true,
  info: true,
  warn: true,
  debug: true,
  stat: true,
}

const RequestCompletedCategories = {
  ApiCall: true,
  PageRequestCompleted: true,
  StaticRequestCompleted: true,
  HMRRequestCompleted: true,
}

const CriticalClientRequestStarted = {
  PageRequestStarted: true,
}

const spaceIf = (next, part) => {
  const nextPart = part ? `${part} ` : ''
  return `${next}${nextPart}`
}

function formatPageRequestId(info) {
  return info ? info.pageRequestId || '' : ''
}

function formatCategory(category) {
  return `${category}:`
}

function formatRequestInfo(info) {
  const requestInfo = `${info.method.toUpperCase()} ${info.url} ${
    info.status
  } ${info.duration}ms`
  if (info.redirect) {
    return `${requestInfo} -> ${info.redirect}`
  }
  return requestInfo
}

function formatMessage(logObj) {
  if (logObj.level === 'error') {
    return ''
  }

  return logObj.message || ''
}

function formatInfoObject(logObj) {
  const info = logObj.info
  const level = logObj.level
  const category = logObj.category

  if (RequestCompletedCategories[category]) {
    return formatRequestInfo(info)
  }

  if (CriticalClientRequestStarted[category]) {
    return formatStartedRequest(info)
  }

  if (category === 'PageView') {
    return info.pageUrl
  }

  if (level === 'info' || level === 'debug' || level === 'stat') {
    const sortedKeys = Object.keys(info).sort()
    const pairs = sortedKeys.map(key => {
      if (key === 'duration') {
        return `${info[key]}ms`
      }
      return `${key}=${info[key]}`
    })
    return pairs.join(' ')
  }

  return `\n${JSON.stringify(info, null, 2)}\n`
}

function formatInfo(logObj) {
  const info = logObj.info

  if (info) {
    delete info.pageRequestId
    delete info.stack
    if (Object.keys(info).length) {
      return formatInfoObject(logObj)
    }
  }

  return ''
}

function formatStartedRequest(info) {
  return `${info.method.toUpperCase()} ${info.url}`
}

function formatLogLine(logObj) {
  if (!logObj.category || !logObj.level || (!logObj.message && !logObj.info)) {
    throw new TError(
      'A logging object requires a category, level and (message or info)',
      {
        name: 'BadLogginObjectFormat',
        info: {
          level: logObj.level,
          category: logObj.category,
          keys: Object.keys(logObj),
        },
      }
    )
  } else if (!levels[logObj.level]) {
    throw new TError('Not a supported log level', {
      name: 'BadLogginLevel',
      info: {
        level: logObj.level,
        category: logObj.category,
        keys: Object.keys(logObj),
      },
    })
  }

  const category = logObj.category
  const info = logObj.info
  const level = logObj.level

  const logLineParts = [
    level.toUpperCase(),
    formatPageRequestId(info),
    formatCategory(category),
    formatMessage(logObj),
    formatInfo(logObj),
  ]

  const logLine = logLineParts.reduce(spaceIf, '')
  return level === 'error' ? `\n${logLine}` : logLine
}

module.exports = function logger(logObj) {
  const stack = logObj.info ? logObj.info.stack : null
  const logLine = formatLogLine(logObj)
  console.log(logLine)
  if (stack) {
    console.log(`${stack}\n`)
  }
}
