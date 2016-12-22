_ = require 'underscore'
{ where, presentCollection } = Article = require '../articles/model'
User = require '../users/model.coffee'

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
