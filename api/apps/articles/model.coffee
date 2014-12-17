#
# Library of retrieval, persistance, validation, json view, and domain logic
# for the "articles" resource.
#

_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../lib/db'
User = require '../users/model'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require 'joi-objectid'
moment = require 'moment'
request = require 'superagent'
{ ObjectId } = require 'mongojs'
{ ARTSY_URL } = process.env

# Validation

schema = (->
  author_id: @objectId().required()
  slug: @string()
  thumbnail_title: @string().allow('', null)
  thumbnail_teaser: @string().allow('', null)
  thumbnail_image: @string().allow('', null)
  tags: @array().includes(@string())
  title: @string().allow('', null)
  published: @boolean().default(false)
  lead_paragraph: @string().allow('', null)
  gravity_id: @objectId().allow('', null)
  sections: @array().includes([
    @object().keys
      type: @string().valid('image')
      url: @string().allow('', null)
      caption: @string().allow('', null)
    @object().keys
      type: @string().valid('text')
      body: @string().allow('', null)
    @object().keys
      type: @string().valid('artworks')
      ids: @array().includes(@string())
      layout: @string().allow('overflow_fillwidth', 'column_width', null)
    @object().keys
      type: @string().valid('video')
      url: @string().allow('', null)
    @object().keys
      type: @string().valid('slideshow')
      items: @array().includes [
        @object().keys
          type: @string().valid('image')
          url: @string().allow('', null)
          caption: @string().allow('', null)
        @object().keys
          type: @string().valid('video')
          url: @string().allow('', null)
        @object().keys
          type: @string().valid('artwork')
          id: @string()
      ]
  ]).default([])
  primary_featured_artist_ids: @array().includes(@string())
  featured_artist_ids: @array().includes(@string())
  featured_artwork_ids: @array().includes(@string())
).call Joi

querySchema = (->
  author_id: @objectId()
  published: @boolean()
  limit: @number()
  offset: @number()
).call Joi

# Retrieval

@where = (query, callback) ->
  Joi.validate query, querySchema, (err, query) ->
    query.author_id = ObjectId(query.author_id) if query.author_id
    return callback err if err
    { limit, offset } = query
    query = _.omit query, 'limit', 'offset'
    cursor = db.articles.find(query).skip(offset or 0)
    async.parallel [
      (cb) -> db.articles.count cb
      (cb) -> cursor.count cb
      (cb) -> cursor.limit(limit or 10).sort(updated_at: -1).toArray cb
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

# Persistence

@save = (article, callback) ->
  id = ObjectId(article._id)
  whitelisted = _.pick article, _.keys schema
  whitelisted.author_id = whitelisted.author_id?.toString()
  Joi.validate whitelisted, schema, (err, article) ->
    return callback err if err
    article.updated_at = moment().format()
    article.author_id = ObjectId article.author_id
    getSlug _.omit(article, 'slug'), (err, slug) ->
      return callback err if err
      article.slugs ?= []
      article.slugs.push slug unless slug in article.slugs
      db.articles.findAndModify {
        query: { _id: id }
        update: article
        upsert: true
        new: true
      }, callback

getSlug = (article, callback) ->
  return callback null, article.slug if article.slug
  titleSlug = _s.slugify(article.title).split('-')[0..7].join('-')
  return callback null, titleSlug unless article.author_id
  User.find article.author_id, (err, user) ->
    return callback null, titleSlug unless user
    callback err, _s.slugify(user.user.name) + '-' + titleSlug

@syncToPost = (article, accessToken, callback) ->

  # Create/update the post with body joined from text sections
  if article.gravity_id
    req = request.put("#{ARTSY_URL}/api/v1/post/#{article.gravity_id}")
  else
    req = request.post("#{ARTSY_URL}/api/v1/post")
  req.send(
    title: article.title
    body: (section.body for section in article.sections).join('')
    published: true
  ).set('X-Access-Token', accessToken).end (err, res) =>

    # If the post isn't found, delete the gravity_id tying it to the article
    # and re-try syncing.
    if res.body.error is 'Post Not Found'
      @save _.extend(article, gravity_id: null), (err) =>
        return callback err if err
        @syncToPost article, accessToken, callback
      return
    return callback err if err = err or res.body.error
    post = res.body

    # Ensure the article is linked to the Gravity post
    @save _.extend(article, { gravity_id: post._id, slug: post.id }), (err, article) ->
      return callback err if err

      # Delete any existing attachments/artworks
      async.parallel [
        (cb) ->
          async.map post.attachments, ((a, cb2) ->
            request
              .del("#{ARTSY_URL}/api/v1/post/#{post._id}/link/#{a.id}")
              .set('X-Access-Token', accessToken)
              .end (err, res) -> cb2()
          ), cb
        (cb) ->
          async.map post.artworks, ((a, cb2) ->
            request
              .del("#{ARTSY_URL}/api/v1/post/#{post._id}/artwork/#{a.id}")
              .set('X-Access-Token', accessToken)
              .end (err, res) -> cb2()
          ), cb
      ], (err) ->
        return callback err if err

        # Add artworks, images and video from the article to the post
        async.mapSeries article.sections, ((section, cb) ->
          switch section.type
            when 'artworks'
              async.mapSeries section.ids, ((id, cb2) ->
                request
                  .post("#{ARTSY_URL}/api/v1/post/#{post._id}/artwork/#{id}")
                  .set('X-Access-Token', accessToken)
                  .end (err, res) -> cb2 (err or res.body.error), res.body
              ), cb
            when 'image', 'video'
              request
                .post("#{ARTSY_URL}/api/v1/post/#{post._id}/link")
                .set('X-Access-Token', accessToken)
                .send(url: section.url)
                .end (err, res) -> cb (err or res.body.error), res.body
            else
              cb()
        ), (err) ->
          return callback err if err
          request
            .get("#{ARTSY_URL}/api/v1/post/#{post._id}")
            .set('X-Access-Token', accessToken)
            .end (err, res) -> callback err, res.body

@destroy = (id, callback) ->
  db.articles.remove { _id: ObjectId(id) }, (err, res) ->
    callback err, res

# JSON views

@presentCollection = (article) =>
  {
    total: article.total
    count: article.count
    results: (@present(obj) for obj in article.results)
  }

@present = (article) =>
  _.extend article,
    id: article._id?.toString()
    _id: undefined
    slug: _.last article.slugs
    slugs: undefined