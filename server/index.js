const express = require('express')
const httpShutdown = require('http-shutdown')
const TError = require('../client/shared/TError')
const logger = require('../client/shared/logger')

let server

if (process.env.NODE_ENV === 'production') {
  process.on('unhandledRejection', reason => {
    const wrappedError = new TError('Unhandled server promise rejection', {
      name: 'UnhandledServerRejectionError',
      cause: reason,
    })
    logger(TError.toLog(wrappedError))
    console.log(reason)
    process.exit(1)
  })

  process.on('uncaughtException', err => {
    const wrappedError = new TError('Fatal server exception', {
      name: 'FatalServerExceptionError',
      cause: err,
    })
    logger(TError.toLog(wrappedError))
    console.log(err)
    process.exit(1)
  })
  process.on('SIGINT', () => {
    console.log('waiting to shutdown', process.pid)
    server.shutdown(err => {
      if (err) {
        const wrappedError = new TError(
          'There was an error shutting down the server',
          {
            name: 'ServerShutdownError',
            cause: err,
          }
        )
        logger(TError.toLog(wrappedError))
        console.log(err)
        process.exit(1)
      } else {
        logger({
          level: 'info',
          category: 'ServerGracefullyShutdown',
          message: 'Server was able to gracefully shutdown',
        })
        console.log('server stopped graceully after completing requests')
        process.exit(0)
      }
    })
  })
} else {
  process.on('unhandledRejection', reason => {
    console.log(reason)
  })

  process.on('uncaughtException', err => {
    console.log(err)
  })
}

module.exports = function startServer(options) {
  const app = express()
  app.set('trust proxy', true)
  app.disable('x-powered-by')
  app.disable('etag')
  if (!options.optimize) {
    const opn = require('opn')
    const appWatcher = require('./watcher.app.js')(options)
    const serverWatcher = require('./watcher.server.js')(options)
    let router = null
    serverWatcher.on('updated', () => {
      router = null
    })
    app.use((req, res, next) => {
      if (!router) {
        router = require('./app/index')(options, appWatcher)
      }
      router(req, res, next)
    })

    const initialUrl = options.initialUrl
    appWatcher.emitter.once('created', () => {
      console.log(`opening ${initialUrl}`)
      opn(initialUrl)
    })
    appWatcher.emitter.once('failed', () => {
      console.log(`opening ${initialUrl} with build errors`)
      opn(initialUrl)
    })
  } else {
    const router = require('./app/index')(options)
    app.use(router)
  }
  const port = process.env.PORT
  server = app.listen(port, () => {
    console.log(`Server listening on port ${port}, pid: ${process.pid}`)
  })
  server = httpShutdown(server)
}
