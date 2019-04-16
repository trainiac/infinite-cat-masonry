import Vue from 'vue'
import UnhandledClientError from 'components/errors/UnhandledClientError'
import WebpackCompiling from 'components/errors/WebpackCompiling'
import clientEmitter from 'webpack-hot-middleware/client'

let dialog
let loader

const DebugDialog = Vue.extend(UnhandledClientError)
const Loader = Vue.extend(WebpackCompiling)

function initDialog() {
  const div = document.createElement('div')
  div.id = 'debug-dialog'
  document.querySelector('#app').appendChild(div)
  dialog = new DebugDialog().$mount('#debug-dialog')
  dialog.$on('requestClose', closeDialog)
}

function initLoader() {
  const div = document.createElement('div')
  div.id = 'webpack-loader-dialog'
  document.querySelector('#app').appendChild(div)
  loader = new Loader().$mount('#webpack-loader-dialog')
}

function openDialog(title, props) {
  if (!dialog) {
    initDialog()
  }
  dialog.title = title
  dialog.message = props.message
  dialog.details = props.info
  dialog.stack = props.stack
  dialog.isOpen = true
}

function closeDialog() {
  if (dialog) {
    dialog.isOpen = false
  }
}

function openLoader() {
  if (!loader) {
    initLoader()
  }
  loader.isOpen = true
}

function closeLoader() {
  if (loader) {
    loader.isOpen = false
  }
}

clientEmitter.subscribeAll(message => {
  if (message.action === 'building') {
    openLoader()
  } else if (message.action === 'built') {
    closeLoader()
    if (message.errors.length || message.warnings.length) {
      openDialog('Webpack Compile Errors', {
        message: 'Oopsy daisy',
        stack: [...message.errors, ...message.warnings].join('\n'),
      })
    } else {
      closeDialog()
    }
  }
})

export default {
  open: openDialog,
}
