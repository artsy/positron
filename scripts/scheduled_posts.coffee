_ = require 'underscore'
Q = require 'bluebird-q'
requestBluebird = require 'superagent-bluebird-promise'
request = require 'superagent'
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

articlesToPublish = []
db.articles.find(
  scheduled_publish_at: { $lt: new Date() }
).on('data', (doc) ->
  if !doc
    debug 'Scheduled publication finished'
    process.exit()
  articlesToPublish.push doc
).on 'end', ->
  db.close()
  Q.all(for article in articlesToPublish
    requestBluebird
      .post("#{process.env.API_URL}/articles/#{article._id}")
      .set('X-Xapp-Token': process.env.ACCESS_TOKEN)
      .send
        published: true
        published_at: moment(article.scheduled_publish_at).toDate()
        scheduled_published_at: null
      .promise()
  ).done (responses) =>
    console.log responses

exit = (err) ->
  console.error "ERROR", err
  process.exit true