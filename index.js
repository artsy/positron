require('babel-core/register')
require('coffee-script/register')
const _ = require('underscore')
const env = require('node-env-file')

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'test') {
  env('./.env.test')

  // If NODE_ENV is development or unset, assume that it's a local setup
} else if (NODE_ENV === 'development' || _.isUndefined(NODE_ENV)) {
  env('./.env')

  // Other envs: staging, production
} else {
  env('./.env', { raise: false })
}

require('./boot')
