#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "articles" resource.
#
_ = require 'underscore'
db = require '../../../lib/db'
async = require 'async'
debug = require('debug') 'api'
{ onPublish, generateSlugs, generateKeywords,
  sanitizeAndSave, onUnpublish } = Save = require './save'
Joi = require '../../../lib/joi'
schema = require './schema'
{ removeFromSearch, deleteArticleFromSailthru } = require './distribute'
retrieve = require './retrieve'
{ ObjectId } = require 'mongojs'
moment = require 'moment'
Q = require 'bluebird-q'

#
# Retrieval
#
@where = (input, callback) =>
  Joi.validate input, schema.querySchema, { stripUnknown: true }, (err, input) =>
    return callback err if err
    @mongoFetch input, callback

@mongoFetch = (input, callback) ->
  { query, limit, offset, sort, count } = retrieve.toQuery input
  cursor = db.articles
    .find(query)
    .skip(offset or 0)
    .sort(sort)
    .limit(limit)
  async.parallel [
    (cb) -> cursor.toArray cb
    (cb) ->
      return cb() unless count
      db.articles.count cb
    (cb) ->
      return cb() unless count
      cursor.count cb
  ], (err, [articles, total, articleCount]) ->
    return callback err if err
    callback null, {
      results: articles
      total: total
      count: articleCount
    }

@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slugs: id }
  db.articles.findOne query, callback

#
# Persistence
#
@save = (input, accessToken, callback) =>
  Joi.validate input, schema.inputSchema, { stripUnknown: true }, (err, input) =>
    return callback err if err
    @find (input.id or input._id)?.toString(), (err, article = {}) =>
      return callback err if err
      generateKeywords input, article, (err, article) ->
        debug err if err
        publishing = (input.published and not article.published) or (input.scheduled_publish_at and not article.published)
        unPublishing = article.published and not input.published
        article = _.extend article, _.omit(input, 'slug'), {updated_at: new Date}
        if input.sections and input.sections.length is 0
          article.sections = []
        # Merge fullscreen title with main article title
        article.title = article.hero_section.title if article.hero_section?.type is 'fullscreen'
        article.author = input.author
        if publishing
          onPublish article, sanitizeAndSave(callback)
        else if unPublishing
          onUnpublish article, sanitizeAndSave(callback)
        else if not publishing and not article.slugs?.length > 0
          generateSlugs article, sanitizeAndSave(callback)
        else
          sanitizeAndSave(callback)(null, article)

@publishScheduledArticles = (callback) ->
  db.articles.find { scheduled_publish_at: { $lt: new Date } } , (err, articles) =>
    return callback err, [] if err
    return callback null, [] if articles.length is 0
    async.map articles, (article, cb) =>
      article = _.extend article,
        published: true
        published_at: moment(article.scheduled_publish_at).toDate()
        scheduled_publish_at: null
      onPublish article, sanitizeAndSave cb
    , (err, results) ->
      return callback err, [] if err
      return callback null, results

@unqueue = (callback) ->
  db.articles.find { $or: [ { weekly_email: true }, { daily_email: true } ] } , (err, articles) =>
    return callback err, [] if err
    return callback null, [] if articles.length is 0
    async.map articles, (article, cb) =>
      article = _.extend article,
        weekly_email: false
        daily_email: false
      onPublish article, sanitizeAndSave cb
    , (err, results) ->
      return callback err, [] if err
      return callback null, results

#
# Destroy
#
@destroy = (id, callback) ->
  @find id, (err, article) =>
    return callback err if err
    return callback 'Article not found.' unless article
    deleteArticleFromSailthru _.last(article.slugs), =>
      db.articles.remove { _id: ObjectId(id) }, (err, res) =>
        return callback err if err
        removeFromSearch id.toString()
        callback null

#
# JSON views
#
@presentCollection = (articles) =>
  {
    total: articles.total
    count: articles.count
    results: (@present(obj) for obj in articles.results)
  }

@present = (article) =>
  scheduled = if (date = article?.scheduled_publish_at) then moment(date).toISOString() else null
  published = if (date = article?.published_at) then moment(date).toISOString() else undefined
  _.extend article,
    id: article?._id?.toString()
    _id: article?._id?.toString()
    slug: _.last article.slugs
    slugs: undefined
    published_at: published
    scheduled_publish_at: scheduled
    updated_at: moment(article?.updated_at).toISOString()
