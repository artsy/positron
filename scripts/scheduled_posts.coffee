Q = require 'bluebird-q'
mongojs = require 'mongojs'
fs = require 'fs'
path = require 'path'
moment = require 'moment'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

db.articles.find({ scheduled_for: { $lt: Date() }, { published: false }) (err, article) ->
  return exit err if err



exit = (err) ->
  console.error "ERROR", err
  process.exit 1