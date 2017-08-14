require('babel-core/register')
require('coffee-script/register')

const env = require('node-env-file')

if (process.env.NODE_ENV === 'test') {
  env('./.env.test')

  // Other envs: development, staging, production
} else {
  env('./.env')
}

require('./boot')
