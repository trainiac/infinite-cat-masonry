const express = require('express')
const HttpStatus = require('http-status-codes')
const path = require('path')
const month = 1000 * 60 * 60 * 24 * 30 // eslint-disable-line no-magic-numbers
module.exports = {
  general: options =>
    express.static(options.paths.staticOutput, {
      maxAge: options.optimize ? month : 0,
    }),
  serverStatic: options => (req, res) =>
    res.sendFile(
      path.join(options.paths.base, 'server', req.path),
      {
        maxAge: 0,
        etag: false,
        lastModified: false,
      },
      function onError(err) {
        if (err) {
          res.status(HttpStatus.NOT_FOUND).send('Not Found')
        }
      }
    ),
  serverStaticCache: options => (req, res) =>
    res.sendFile(
      path.join(options.paths.base, 'server', req.path),
      {
        maxAge: options.optimize ? month : 0,
        etag: false,
        lastModified: false,
      },
      function onError(err) {
        if (err) {
          res.status(HttpStatus.NOT_FOUND).send('Not Found')
        }
      }
    ),
}
