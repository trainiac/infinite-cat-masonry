function ExtendableError(message) {
  const instance = new Error(message)
  const proto = Object.getPrototypeOf(this)
  Object.setPrototypeOf(instance, proto)
  return instance
}

ExtendableError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true,
  },
})

Object.setPrototypeOf(ExtendableError, Error)

class TError extends ExtendableError {
  constructor(message, options) {
    super(message)
    this.name = options && options.name ? options.name : this.constructor.name
    this.level = options && options.level ? options.level : undefined
    if (options && options.cause) {
      this.cause = options.cause
    }
    this.info = options && options.info ? Object.assign({}, options.info) : {}
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toString() {
    return TError.fullMessage(this)
  }

  static getCause(err) {
    return err && err.cause ? err.cause : null
  }

  static fullInfo(err) {
    const cause = TError.getCause(err)
    const info = cause !== null ? TError.fullInfo(cause) : {}
    if (err.info) {
      return Object.assign(info, err.info)
    }

    return info
  }

  static fullStack(err) {
    const cause = TError.getCause(err)

    // IE doesn't have stack
    const stack = err.stack || err.name
    if (cause) {
      return `${stack}\n\nCaused by\n\n${TError.fullStack(cause)}`
    }

    return stack
  }

  static fullName(err) {
    const cause = TError.getCause(err)

    if (cause) {
      return `${err.name}.${TError.fullName(cause)}`
    }

    return err.name
  }

  static fullMessage(err) {
    const cause = TError.getCause(err)
    const message = `${err.name}: ${err.message}`

    if (cause) {
      return `${message} > ${TError.fullMessage(cause)}`
    }

    return message
  }

  static getLevel(err) {
    if (err && err.level) {
      return err.level
    }
    const cause = TError.getCause(err)
    if (cause) {
      return TError.getLevel(cause)
    }
    return undefined
  }

  static toLog(err, level = 'error') {
    const logObj = {
      level: TError.getLevel(err) || level,
      category: TError.fullName(err),
      message: TError.fullMessage(err),
      info: TError.fullInfo(err),
    }

    if (level === 'error') {
      logObj.info.stack = TError.fullStack(err)
    }

    return logObj
  }
}

module.exports = TError
