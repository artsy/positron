require('babel-core/register')
require('coffee-script/register')

const env = require('node-env-file')

if (process.env.NODE_ENV === 'test') {
  env('./.env.test')
} else if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === 'development') {
  // If NODE_ENV is unset, assume that it's a local setup
  env('./.env')
} else {
  // Other envs: staging, production
  env('./.env', { raise: false })
}

require('./boot')
