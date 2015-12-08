Q = require 'bluebird-q'
mongojs = require 'mongojs'
fs = require 'fs'
path = require 'path'
moment = require 'moment'
debug = require('debug') 'scripts'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

db.articles.find(
  scheduled_publish_at: { $lt: new Date() }
).forEach (err, doc) ->
  if !doc
    debug 'Scheduled publication finished'
    process.exit()
  if err
    exit err
  doc.published = true
  doc.published_at = moment(doc.scheduled_publish_at).toDate()
  doc.scheduled_publish_at = null
  db.articles.save doc

exit = (err) ->
  console.error "ERROR", err
  process.exit true