#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "articles" resource.
#
_ = require 'underscore'
db = require '../../../lib/db'
async = require 'async'
{ validate, onPublish, generateSlugs, generateKeywords,
generateArtworks, sanitizeAndSave, mergeArticleAndAuthor } = require './save'
retrieve = require './retrieve'
{ ObjectId } = require 'mongojs'

#
# Retrieval
#
@where = (input, callback) ->
  retrieve.toQuery input, (err, query, limit, offset, sort) ->
    return callback err if err
    cursor = db.articles.find(query).skip(offset or 0).sort(sort)
    async.parallel [
      (cb) -> db.articles.count cb
      (cb) -> cursor.count cb
      (cb) -> cursor.limit(limit).toArray cb
    ], (err, [ total, count, results ]) ->
      return callback err if err
      callback null, {
        total: total
        count: count
        results: results
      }

@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slugs: id }
  db.articles.findOne query, callback

#
# Persistence
#
@save = (input, accessToken, callback) ->
  validate input, (err, input) =>
    return callback err if err
    id = ObjectId (input.id or input._id)?.toString()
    @find id.toString(), (err, article = {}) =>
      return callback err if err
      generateKeywords input, article, accessToken, (err, article) ->
        debug err if err
        generateArtworks input, article, accessToken, (err, article) ->
          debug err if err
          mergeArticleAndAuthor input, article, accessToken, (err, article, author, publishing) ->
            return callback(err) if err
            # Merge fullscreen title with main article title
            article.title = article.hero_section.title if article.hero_section?.type is 'fullscreen'
            if publishing
              onPublish article, author, accessToken, sanitizeAndSave(callback)
            else if not publishing and not article.slugs?.length > 0
              generateSlugs article, author, sanitizeAndSave(callback)
            else
              sanitizeAndSave(callback)(null, article)

# Destroy
#
@destroy = (id, callback) ->
  db.articles.remove { _id: ObjectId(id) }, callback

#
# JSON views
#
@presentCollection = (article) =>
  {
    total: article.total
    count: article.count
    results: (@present(obj) for obj in article.results)
  }

@present = (article) =>
  _.extend article,
    id: article?._id?.toString()
    _id: undefined
    slug: _.last article.slugs
    slugs: undefined
