const paths = require('./paths')
const envs = require('./envs')

const buildEnvVars = ['NODE_ENV', 'ASSETS_URL']

const serverEnvVars = ['NODE_ENV', 'PORT']

function checkEnv(envName, isServing) {
  if (envName) {
    const env = envs[envName]
    for (const envVar in env) {
      if (env.hasOwnProperty(envVar) && !process.env.hasOwnProperty(envVar)) {
        process.env[envVar] = env[envVar]
      }
    }
  }

  const requiredEnvVars = isServing ? serverEnvVars : buildEnvVars
  const missing = []
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  })

  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing}`)
  }
}

function processEnv(args, isServing) {
  checkEnv(args.env, isServing)

  const options = {
    optimize: process.env.NODE_ENV === 'production',
    paths,
    verbose: Boolean(args.verbose),
    analyze: Boolean(args.analyze),
  }
  return options
}

module.exports = {
  stringifyValues(obj) {
    const newObj = {}
    for (const prop in obj) {
      newObj[prop] = JSON.stringify(obj[prop])
    }
    return newObj
  },
  processServerEnv(args) {
    return processEnv(args, true)
  },
  processBuildEnv(args) {
    return processEnv(args, false)
  },
}
