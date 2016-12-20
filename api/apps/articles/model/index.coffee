#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "articles" resource.
#
_ = require 'underscore'
db = require '../../../lib/db'
async = require 'async'
debug = require('debug') 'api'
{ validate, onPublish, generateSlugs, generateKeywords,
generateArtworks, sanitizeAndSave, removeFromSearch,
deleteArticleFromSailthru, onUnpublish } = Save = require './save'
retrieve = require './retrieve'
{ ObjectId } = require 'mongojs'
moment = require 'moment'
Q = require 'bluebird-q'

#
# Retrieval
#
@where = (input, callback) ->
  retrieve.toQuery input, (err, query, limit, offset, sort) ->
    return callback err if err
    cursor = db.articles
      .find(query)
      .skip(offset or 0)
      .sort(sort)
      .limit(limit)
    async.parallel [
      (cb) -> db.articles.count cb
      (cb) -> cursor.count cb
      (cb) -> cursor.toArray cb
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
@save = (input, accessToken, callback) =>
  validate typecastIds(input), (err, input) =>
    return callback err if err
    @find (input.id or input._id)?.toString(), (err, article = {}) =>
      return callback err if err
      generateKeywords input, article, (err, article) ->
        debug err if err
        generateArtworks input, article, (err, article) ->
          debug err if err
          publishing = (input.published and not article.published) or (input.scheduled_publish_at and not article.published)
          unPublishing = article.published and not input.published
          article = _.extend article, _.omit(input, 'sections', 'slug'), updated_at: new Date
          if input.sections and input.sections.length is 0
            article.sections = []
          # Merge fullscreen title with main article title
          article.title = article.hero_section.title if article.hero_section?.type is 'fullscreen'
          article.author = input.author
          if publishing
            debugger
            console.log 'HI'
            onPublish article, sanitizeAndSave(callback)
          else if unPublishing
            onUnpublish article, sanitizeAndSave(callback)
          else if not publishing and not article.slugs?.length > 0
            generateSlugs article, sanitizeAndSave(callback)
          else
            sanitizeAndSave(callback)(null, article)

@publishScheduledArticles = (callback) ->
  db.articles.find { scheduled_publish_at: { $lt: new Date() } } , (err, articles) =>
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
  @find id, (err, article = {}) =>
    deleteArticleFromSailthru article, =>
      db.articles.remove { _id: ObjectId(id) }, =>
        removeFromSearch id.toString()
        callback(id)

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

# Converts an input from the db that use ObjectId to String
typecastIds = (article) ->
  _.extend article,
    # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    _id: article._id.toString() if article._id
    author: if article.author? then _.extend article.author, id: article.author.id?.toString() else {}
    contributing_authors: article.contributing_authors.map( (author)->
      author.id = author.id.toString() if author.id
      author
    ) if article.contributing_authors
    author_id: article.author_id.toString() if article.author_id
    fair_ids: article.fair_ids.map(String) if article.fair_ids
    fair_programming_ids: article.fair_programming_ids.map(String) if article.fair_programming_ids
    fair_artsy_ids: article.fair_artsy_ids.map(String) if article.fair_artsy_ids
    fair_about_ids: article.fair_about_ids.map(String) if article.fair_about_ids
    section_ids: article.section_ids.map(String) if article.section_ids
    auction_ids: article.auction_ids.map(String) if article.auction_ids
    partner_ids: article.partner_ids.map(String) if article.partner_ids
    show_ids: article.show_ids.map(String) if article.show_ids
    primary_featured_artist_ids: article.primary_featured_artist_ids.map(String) if article.primary_featured_artist_ids
    featured_artist_ids: article.featured_artist_ids.map(String) if article.featured_artist_ids
    featured_artwork_ids: article.featured_artwork_ids.map(String) if article.featured_artwork_ids
    biography_for_artist_id: article.biography_for_artist_id.toString() if article.biography_for_artist_id
    super_article: if article.super_article?.related_articles then _.extend article.super_article, related_articles: article.super_article.related_articles.map(String) else {}
    channel_id: article.channel_id.toString() if article.channel_id
    partner_channel_id: article.partner_channel_id.toString() if article.partner_channel_id
