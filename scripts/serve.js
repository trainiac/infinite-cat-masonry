// add --trace-sync-io above for sync profiling
const minimist = require('minimist')
const processServerEnv = require('../config/utils').processServerEnv
const args = minimist(process.argv.slice(2))

/*
  --env to set an environment (for local development only)
  --verbose for more logging output
*/

const options = processServerEnv(args)
options.initialUrl = 'http://localhost:3005/home'
if (options.verbose) {
  JSON.stringify(options, null, 4)
}

const startServer = require('../server/index.js')
startServer(options)
