import Vue from 'vue'
import { vueGetName } from 'utils/vue'
const TError = require('shared/TError')
const logger = require('shared/logger')

const vendorMessages = [
  // Chrome from autocomplete bug.
  '__gCrWeb.autofill.extractForms',
  // safari-extension
  'honey._native.tabs.getCurrent',
]

const vendorStacks = []

const isVendorError = error => {
  return (
    (error.message &&
      vendorMessages.some(vMesssage => error.message.includes(vMesssage))) ||
    (error.stack && vendorStacks.some(vStack => error.stack.includes(vStack)))
  )
}

const getErrorHandler = (onError, unsubscribe) => e => {
  if (e.error && isVendorError(e.error)) {
    return
  }

  unsubscribe()

  let wrappedError
  const message = 'Uncaught exception in window event listener'

  if (e.error) {
    wrappedError = new TError(message, {
      name: 'UncaughtExceptionError',
      cause: e.error,
    })
  } else {
    wrappedError = new TError(message, {
      name: 'EmptyUncaughtExceptionError',
    })
  }

  onError(wrappedError)
}

const getRejectionHandler = (onRejection, unsubscribe) => e => {
  const reason = e.reason
  if (reason && isVendorError(reason)) {
    return
  }
  unsubscribe()

  let wrappedError
  const message = 'Unhandled promise rejection'

  if (reason) {
    wrappedError = new TError(message, {
      name: 'UnhandledRejectionError',
      cause: reason,
    })
  } else {
    wrappedError = new TError(message, {
      name: 'EmptyUnhandledRejectionError',
    })
  }

  onRejection(wrappedError)
}

const getVueErrorHandler = onVueError => (err, component, vueInfo) => {
  Vue.config.errorHandler = undefined
  const wrappedError = new TError('Uncaught Vue error', {
    name: 'VueError',
    cause: err,
    info: {
      componentName: vueGetName(component) || 'Unknown',
      vueInfo,
    },
  })
  onVueError(wrappedError)
}

function setupErrorHandlers(onError) {
  const errorHandler = getErrorHandler(onError, () => {
    window.removeEventListener('error', errorHandler)
  })
  const rejectionHandler = getRejectionHandler(onError, () => {
    window.removeEventListener('unhandledrejection', rejectionHandler)
  })
  const vueErrorHandler = getVueErrorHandler(onError)
  window.addEventListener('error', errorHandler)
  window.addEventListener('unhandledrejection', rejectionHandler)
  Vue.config.errorHandler = vueErrorHandler
}

function logErr(err) {
  logger(TError.toLog(err))
}

if (process.env.NODE_ENV === 'development') {
  const debugDialog = require('./debugDialogs').default
  setupErrorHandlers(err => {
    logErr(err)
    debugDialog.open(TError.fullName(err), {
      message: TError.fullMessage(err),
      stack: TError.fullStack(err),
      info: TError.fullInfo(err),
    })
  })
} else {
  setupErrorHandlers(logErr)
}
