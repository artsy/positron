#
# Ensures any authors of articles have an Artsy Writer user, and that all
# Artsy Writer users have some Gravity data.
#

require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
moment = require 'moment'
db = require './db'
_ = require 'underscore'
request = require 'superagent'
User = require '../apps/users/model.coffee'
async = require 'async'
{ ARTSY_URL, ARTSY_ID, ARTSY_SECRET } = process.env

module.exports = (callback) ->
  start = moment()

  # Get an xapp token
  request.get("#{ARTSY_URL}/api/v1/xapp_token").query(
    client_id: ARTSY_ID
    client_secret: ARTSY_SECRET
  ).end (err, res) =>
    return callback err if err
    xappToken = res.body.xapp_token

    # Find the authors that aren't users yet
    db.users.distinct '_id', {}, (err, userIds) ->
      return callback err if err
      q = { author_id: $nin: userIds }
      db.articles.distinct 'author_id', q, (err, authorIds) ->
        return callback err if err
        return callback() unless authorIds.length

        # Fetch Gravity user data for the missing authors in batches with 
        # pauses in between
        console.log "Syncing a total of #{authorIds.length} users"
        async.timesSeries Math.ceil(authorIds.length / 20), (n, cb) ->
          syncUsersByIds _.compact(authorIds[n...n + 20]), xappToken, ->
            setTimeout cb, 5000
        , (err) ->
          console.log "Took #{moment().diff(start)}ms"
          callback()

syncUsersByIds = (ids, xappToken, callback) ->
  console.log "Syncing #{ids.length} users"
  async.map ids, (id, cb) ->
    User.upsertWithGravityData {
      id: id.toString()
      xappToken: xappToken
    }, (err, user) ->
      # User doesn't exist, so empty any articles with that author
      if err?.message is 'User Not Found'
        console.log err, id
        db.articles.update(
          { author_id: id }
          { $set: author_id: null }
          { multi: true },
          -> cb()
        )
      else if err
        console.warn err
        cb err
      else
        console.log "Sycned #{name}" if name = user?.user?.name
        cb null, user
  , callback

return unless module is require.main
module.exports (err) ->
  console.warn err
  process.exit 1
