db = require './api/lib/db'
User = require './api/apps/users/model'
async = require 'async'
db.articles.find { author_id: { $ne: null }, author: null }, (err, articles) ->
  console.log "Denormalizing for #{articles.length}..."
  async.map articles, (article, cb) ->
    db.users.findOne { _id: article.author_id }, (err, user) ->
      console.log "User #{article.author_id} not found for article #{article._id}" if not user
      return if err or not user
      article.author = User.denormalizedForArticle user
      db.articles.save article, (err, a) ->
        if err
          console.log "Fail", err
        else
          console.log "Saved", a._id
        cb()
  , -> console.log "FIN"
null