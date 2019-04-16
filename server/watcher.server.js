const path = require('path')
const chokidar = require('chokidar')
const prettyjson = require('prettyjson')
const EventEmitter = require('events')
const emitter = new EventEmitter()

module.exports = function serverWatcher(options) {
  if (options.verbose) {
    console.log(prettyjson.render(options))
  }

  const cwd = process.cwd()
  const watcher = chokidar.watch([
    path.resolve(cwd, 'server/app'),
    path.resolve(cwd, 'client/shared'),
  ])

  watcher.on('ready', () => {
    watcher.on('all', () => {
      Object.keys(require.cache).forEach(id => {
        if (id.includes('/server/app/') || id.includes('/client/shared/')) {
          delete require.cache[id]
        }
      })
      console.log('Server code updated')
      emitter.emit('updated')
    })
  })

  return emitter
}
