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

#
# Schemas
#
schema = (->
  author_id: @objectId().required()
  tier: @number().default(2)
  slug: @string().allow(null)
  thumbnail_title: @string().allow('', null)
  thumbnail_teaser: @string().allow('', null)
  thumbnail_image: @string().allow('', null)
  tags: @array().items(@string())
  title: @string().allow('', null)
  published: @boolean().default(false)
  lead_paragraph: @string().allow('', null)
  gravity_id: @objectId().allow('', null)
  sections: @array().items([
    @object().keys
      type: @string().valid('image')
      url: @string().allow('', null)
      caption: @string().allow('', null)
    @object().keys
      type: @string().valid('text')
      body: @string().allow('', null)
    @object().keys
      type: @string().valid('artworks')
      ids: @array().items(@objectId())
      layout: @string().allow('overflow_fillwidth', 'column_width', null)
    @object().keys
      type: @string().valid('video')
      url: @string().allow('', null)
    @object().keys
      type: @string().valid('slideshow')
      items: @array().items [
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
  primary_featured_artist_ids: @array().items(@objectId()).allow(null)
  featured_artist_ids: @array().items(@objectId()).allow(null)
  featured_artwork_ids: @array().items(@objectId()).allow(null)
  fair_id: @objectId().allow('', null)
  partner_ids: @array().items(@objectId()).allow(null)
  featured: @boolean().default(false)
).call Joi

querySchema = (->
  author_id: @objectId()
  published: @boolean()
  limit: @number()
  offset: @number()
  artist_id: @objectId()
  artwork_id: @objectId()
  fair_ids: @array()
  partner_id: @objectId()
  sort: @string()
  tier: @number()
  featured: @boolean()
).call Joi

#
# Retrieval
#
@where = (input, callback) ->
  toQuery input, (err, query, limit, offset, sort) ->
    return callback err if err
    cursor = db.articles.find(query).skip(offset or 0).sort(sort)
    async.parallel [
      (cb) -> db.articles.count cb
      (cb) -> cursor.count cb
      (cb) -> cursor.limit(limit or 10).toArray cb
    ], (err, [ total, count, results ]) ->
      return callback err if err
      callback null, {
        total: total
        count: count
        results: results
      }

toQuery = (input, callback) ->
  Joi.validate input, querySchema, (err, input) ->
    return callback err if err
    # Separate "find" query from sort/offest/limit
    { limit, offset, sort } = input
    query = _.omit input, 'limit', 'offset', 'sort', 'artist_id', 'artwork_id',
      'fair_ids', 'partner_id'
    # Type cast IDs
    query.author_id = ObjectId input.author_id if input.author_id
    query.fair_id = { $in: _.map(input.fair_ids, ObjectId) } if input.fair_ids
    query.partner_ids = ObjectId input.partner_id if input.partner_id
    # Convert query for articles featured to an artist or artwork
    query.$or = [
      { primary_featured_artist_ids: ObjectId(input.artist_id) }
      { featured_artist_ids: ObjectId(input.artist_id) }
    ] if input.artist_id
    query.featured_artwork_ids = ObjectId input.artwork_id if input.artwork_id
    callback null, query, limit, offset, sortParamToQuery(sort)

sortParamToQuery = (input) ->
  return { updated_at: -1 } unless input
  sort = {}
  for param in input.split(',')
    if param.substring(0, 1) is '-'
      sort[param.substring(1)] = -1
    else
      sort[param] = 1
  sort

@find = (id, callback) ->
  query = if ObjectId.isValid(id) then { _id: ObjectId(id) } else { slugs: id }
  db.articles.findOne query, callback

#
# Persistence
#
@save = (input, cb) ->
  id = ObjectId (input.id or input._id)?.toString()
  validate input, (err, input) =>
    return cb err if err
    @find id.toString(), (err, article = {}) =>
      return cb err if err
      update article, input, (err, article) =>
        return cb err if err
        db.articles.save _.extend(article,
          _id: id
          author_id: ObjectId(article.author_id)
          fair_id: ObjectId(article.fair_id) if article.fair_id
        ), cb

validate = (input, callback) ->
  whitelisted = _.pick input, _.keys schema
  # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
  whitelisted.author_id = whitelisted.author_id?.toString()
  whitelisted.fair_id = whitelisted.fair_id?.toString()
  Joi.validate whitelisted, schema, callback

update = (article, input, callback) ->
  input.published_at = new Date if input.published and not article.published
  article = _.extend article, input, updated_at: new Date
  User.find article.author_id, (err, author) ->
    return callback err if err
    article = addSlug article, author
    article = denormalizeAuthor article, author
    callback null, article

addSlug = (article, author, callback) ->
  titleSlug = _s.slugify(article.title).split('-')[0..7].join('-')
  if article.slug
    slug = article.slug
  else if author
    slug = _s.slugify(author.user.name) + '-' + titleSlug
  else
    slug = titleSlug
  article.slugs ?= []
  article.slugs.push slug unless slug in article.slugs
  article

denormalizeAuthor = (article, author, callback) ->
  article.author = User.denormalizedForArticle(author) if author
  article

@syncToPost = (article, accessToken, callback) ->

  # Delete any pre-synced post
  request
    .del("#{ARTSY_URL}/api/v1/post/#{article.gravity_id or ''}")
    .set('X-Access-Token', accessToken)
    .end =>

      # Create the post with body joined from text sections
      User.find article.author_id, (err, author) =>
        return callback err if err
        request
          .post("#{ARTSY_URL}/api/v1/post")
          .set('X-Access-Token', accessToken)
          .send(
            title: article.title
            body: article.lead_paragraph +
              (section.body for section in article.sections).join('')
            published: true
            author_id: author?.user?.id?.toString()
            profile_id: author?.profile?.id?.toString()
          ).set('X-Access-Token', accessToken).end (err, res) =>
            post = res.body
            return cb err if err = err or res.body.error

            # Ensure the article is linked to the Gravity post & published
            @save _.extend(article, {
              gravity_id: post._id
              slug: post.id
              published: true
            }), (err, article) ->
              return callback err if err

              # Repost to gallery profiles
              async.map (article.partner_ids or []), (id, cb) ->
                request
                  .get("#{ARTSY_URL}/api/v1/partner/#{id.toString()}")
                  .set('X-Access-Token', accessToken)
                  .end (err, res) ->
                    return cb err if err = err or res.body.error
                    request
                      .post("#{ARTSY_URL}/api/v1/repost")
                      .send(post_id: post.id, profile_id: res.body.default_profile_id)
                      .set('X-Access-Token', accessToken)
                      .end (err, res) -> cb err or res.body.error
              , (err) =>
                return callback err if err

                # Feature to artist pages
                artistIds = (article.featured_artist_ids or []).concat(
                  article.primary_featured_artist_ids
                )
                async.map (artistIds or []).map(String), (id, cb) ->
                  request
                    .post("#{ARTSY_URL}/api/v1/post/#{post.id}/artist/#{id}/feature")
                    .set('X-Access-Token', accessToken)
                    .end (err, res) -> cb (err or res.body.error), res.body
                , (err) =>
                  # TODO: Figure out what to do with "Artist not Found" errors
                  # return callback err if err

                  # Feature to artwork pages
                  async.map (article.featured_artwork_ids or []).map(String), (id, cb) ->
                    request
                      .post("#{ARTSY_URL}/api/v1/post/#{post.id}/artwork/#{id}/feature")
                      .set('X-Access-Token', accessToken)
                      .end (err, res) -> cb (err or res.body.error), res.body
                  , (err) =>
                    # TODO: Figure out what to do with "Artwork not Found" errors
                    # return callback err if err

                    # Add artworks, images and video from the slideshow to the post
                    if article.sections[0]?.type is 'slideshow'
                      items = article.sections[0].items
                    else
                      items = []
                    async.mapSeries items, ((item, cb) ->
                      switch item.type
                        when 'artwork'
                          request
                            .post("#{ARTSY_URL}/api/v1/post/#{post._id}/artwork/#{item.id}")
                            .set('X-Access-Token', accessToken)
                            .end (err, res) -> cb (err or res.body.error), res.body
                        when 'image', 'video'
                          request
                            .post("#{ARTSY_URL}/api/v1/post/#{post._id}/link")
                            .set('X-Access-Token', accessToken)
                            .send(url: item.url)
                            .end (err, res) -> cb (err or res.body.error), res.body
                        else
                          cb()
                    ), (err) ->
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
                          .end (err, res) -> callback (err or res.body.error), res.body

@destroy = (id, callback) ->
  db.articles.remove { _id: ObjectId(id) }, (err, res) ->
    callback err, res

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
