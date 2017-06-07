_ = require 'underscore'
User = require '../users/model.coffee'
{ where, presentCollection } = Article = require '../articles/model'
Curation = require '../curations/model'
Channel = require '../channels/model'
Tag = require '../tags/model'
Author = require '../authors/model'

module.exports.articles = (root, args, req, ast) ->
  if (not args.published or args.scheduled) and not args.channel_id
    throw new Error 'Must pass channel_id to view unpublished articles. Or pass ' +
      'published: true to only view published articles.'

  access = User.hasChannelAccess req.user, args.channel_id
  if (not args.published or args.scheduled) and not access
    throw new Error 'Must be a member of this channel to view unpublished articles. ' +
      'Pass published: true to only view published articles.'

  return new Promise (resolve, reject) ->
    where args, (err, results) ->
      resolve presentCollection(results).results

module.exports.curations = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Curation.where args, (err, results) ->
      resolve results.results

module.exports.channels = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Channel.where args, (err, results) ->
      resolve results.results

module.exports.tags = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Tag.where args, (err, results) ->
      resolve results.results

module.exports.authors = (root, args, req, ast) ->
  return new Promise (resolve, reject) ->
    Author.where args, (err, results) ->
      resolve results.results