# _ = require 'underscore'
# Q = require 'bluebird-q'
# requestBluebird = require 'superagent-bluebird-promise'
# request = require 'superagent'
# mongojs = require 'mongojs'
# fs = require 'fs'
# path = require 'path'
# moment = require 'moment'
# debug = require('debug') 'scripts'
# artsyXapp = require 'artsy-xapp'

# # Setup environment variables
# env = require 'node-env-file'
# switch process.env.NODE_ENV
#   when 'test' then env path.resolve __dirname, '../.env.test'
#   when 'production', 'staging' then ''
#   else env path.resolve __dirname, '../.env'

# # Connect to database
# db = mongojs(process.env.MONGOHQ_URL, ['articles'])

# articlesToPublish = []
# db.articles.find(
#   scheduled_publish_at: { $lt: new Date() }
# ).on('data', (doc) ->
#   if !doc
#     debug 'Scheduled publication finished'
#     process.exit()
#   articlesToPublish.push doc
# ).on 'end', ->
#   artsyXapp.init { url: process.env.ARTSY_URL, id: process.env.ARTSY_ID, secret: process.env.ARTSY_SECRET }, ->
#     Q.all( for article in articlesToPublish
#       requestBluebird
#         .put("https://stagingwriter.artsy.net/api/articles/#{articlesToPublish[0]._id}")
#         .set('X-Xapp-Token': artsyXapp.token)
#         .send
#           published: true
#           published_at: moment(articlesToPublish[0].scheduled_publish_at).toDate()
#           scheduled_publish_at: null
#         .promise()
#     ).done (err, responses) ->
#       console.log err
#       console.log responses
#       db.close()
#       exit(if err then err else null)

# exit = (err) ->
#   console.error "ERROR", err if err
#   process.exit true

path = require 'path'

# # Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

Article = require '../api/apps/articles/model/index.coffee'
Article.publishScheduledArticles()
