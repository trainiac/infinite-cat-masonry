const debra = require('debra')
const logger = require('../../client/shared/logger')
const getLevel = require('./utils').getLevel

const reqUrl = req => req.originalUrl || req.url

module.exports = {
  request() {
    return (req, res, next) => {
      logger(
        {
          level: 'debug',
          info: {
            method: req.method,
            url: reqUrl(req),
          },
          category: 'PageRequestStarted',
        },
        req.hostname
      )
      next()
    }
  },
  response() {
    return debra(
      (tokens, req, res) => {
        const info = {
          url: req.originalUrl || req.url,
          method: req.method,
          status: tokens.status(req, res),
          referrer: tokens.referrer(req),
          duration: tokens['response-time'](req, res),
          userAgent: req.get('User-Agent'),
        }

        const location = tokens.res(req, res, 'Location')

        if (location) {
          info.redirect = location
        }

        return {
          level: getLevel(req, res),
          category: 'PageRequestCompleted',
          info,
        }
      },
      {
        stream: {
          write(info) {
            logger(info)
          },
        },
        objectMode: true,
      }
    )
  },
}
