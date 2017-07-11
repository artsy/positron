_ = require 'underscore'
User = require '../users/model.coffee'
{ mongoFetch, presentCollection, find, present } = Article = require '../articles/model'
Curation = require '../curations/model'
Channel = require '../channels/model'
Tag = require '../tags/model'
Author = require '../authors/model'

module.exports.articles = (root, args, req, ast) ->
  unpublished = not args.published or args.scheduled
  if unpublished and not args.channel_id
    throw new Error 'Must pass channel_id to view unpublished articles. Or pass ' +
      'published: true to only view published articles.'

  unauthorized = not User.hasChannelAccess req.user, args.channel_id
  if unpublished and unauthorized
    throw new Error 'Must be a member of this channel to view unpublished articles. ' +
      'Pass published: true to only view published articles.'

  return new Promise (resolve, reject) ->
    mongoFetch args, (err, results) ->
      resolve presentCollection(results).results

module.exports.article = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    find args.id, (err, results) ->
      if results
        unpublished = not results.published or results.scheduled
        unauthorized = not User.hasChannelAccess req.user, results.channel_id
        if unpublished and unauthorized
          reject new Error 'Must be a member of the channel to view an unpublished article.'
        else
          resolve present(results)
      else
        reject new Error 'Article not found.'

module.exports.curations = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Curation.mongoFetch args, (err, results) ->
      resolve results.results

module.exports.channels = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Channel.mongoFetch args, (err, results) ->
      resolve results.results

module.exports.tags = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Tag.mongoFetch args, (err, results) ->
      resolve results.results

module.exports.authors = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Author.mongoFetch args, (err, results) ->
      resolve results.results