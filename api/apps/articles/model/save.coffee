_ = require 'underscore'
_s = require 'underscore.string'
db = require '../../../lib/db'
User = require '../../users/model'
async = require 'async'
Joi = require 'joi'
Joi.objectId = require('joi-objectid') Joi
moment = require 'moment'
xss = require 'xss'
cheerio = require 'cheerio'
url = require 'url'
Q = require 'bluebird-q'
request = require 'superagent'
requestBluebird = require 'superagent-bluebird-promise'
Backbone = require 'backbone'
{ ArtworkHelpers } = require 'artsy-backbone-mixins'
debug = require('debug') 'api'
schema = require './schema'
Article = require './index'
{ ObjectId } = require 'mongojs'
cloneDeep = require 'lodash.clonedeep'
{ ARTSY_URL, SAILTHRU_KEY, SAILTHRU_SECRET,
EMBEDLY_KEY, FORCE_URL, ARTSY_EDITORIAL_ID, SECURE_IMAGES_URL } = process.env
sailthru = require('sailthru-client').createSailthruClient(SAILTHRU_KEY,SAILTHRU_SECRET)
{ crop } = require('embedly-view-helpers')(EMBEDLY_KEY)
artsyXapp = require('artsy-xapp')

@validate = (input, callback) ->
  whitelisted = _.pick input, _.keys schema.inputSchema
  # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
  whitelisted.author_id = whitelisted.author_id?.toString()
  whitelisted.fair_id = whitelisted.fair_id?.toString()
  Joi.validate whitelisted, schema.inputSchema, callback

@onPublish = (article, author, cb) =>
  if not article.published_at
    article.published_at = new Date()
  @generateSlugs article, author, cb

@generateSlugs = (article, author, cb) ->
  slug = _s.slugify author.name + ' ' + article.thumbnail_title
  return cb null, article if slug is _.last(article.slugs)
  db.articles.count { slugs: slug }, (err, count) ->
    return cb(err) if err
    slug = slug + '-' + moment(article.published_at).format('MM-DD-YY') if count
    article.slugs = (article.slugs or []).concat slug
    cb(null, article)

@generateKeywords = (input, article, cb) ->
  keywords = []
  callbacks = []
  if (input.primary_featured_artist_ids is not article.primary_featured_artist_ids or
      input.featured_artist_ids is not article.featured_artist_ids or
      input.fair_id is not article.fair_id or
      input.partner_ids is not article.partner_ids or
      input.tags is not article.tags)
    return cb(null, article)
  if input.primary_featured_artist_ids
    for artistId in input.primary_featured_artist_ids
      do (artistId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/artist/#{artistId}")
            .set('X-Xapp-Token': artsyXapp.token)
            .end callback
  if input.featured_artist_ids
    for artistId in input.featured_artist_ids
      do (artistId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/artist/#{artistId}")
            .set('X-Xapp-Token': artsyXapp.token)
            .end callback
  if input.fair_id
    callbacks.push (callback) ->
      request
        .get("#{ARTSY_URL}/api/v1/fair/#{input.fair_id}")
        .set('X-Xapp-Token': artsyXapp.token)
        .end callback
  if input.partner_ids
    for partnerId in input.partner_ids
      do (partnerId) ->
        callbacks.push (callback) ->
          request
            .get("#{ARTSY_URL}/api/v1/partner/#{partnerId}")
            .set('X-Xapp-Token': artsyXapp.token)
            .end callback
  async.parallel callbacks, (err, results) =>
    return cb(err) if err
    keywords = (res.body.name for res in results)
    keywords.push(tag) for tag in input.tags if input.tags
    article.keywords = keywords[0..9]
    cb(null, article)

@generateArtworks = (input, article, cb) ->
  before = _.flatten _.pluck _.where(article.sections, type: 'artworks'), 'ids'
  after = _.flatten _.pluck _.where(input.sections, type: 'artworks'), 'ids'
  intersection = _.intersection(before, after)
  article.sections = input.sections
  return cb(null, article) if intersection.length is before.length and intersection.length is after.length
  # Try to fetch and denormalize the artworks from Gravity asynchonously
  artworkIds = _.pluck (_.where input.sections, type: 'artworks' ), 'ids'
  Q.allSettled( for artworkId in _.flatten artworkIds
    requestBluebird
      .get("#{ARTSY_URL}/api/v1/artwork/#{artworkId}")
      .set('X-Xapp-Token': artsyXapp.token)
  ).done (responses) =>
    fetchedArtworks = _.map responses, (res) ->
      res.value?.body
    newSections = []
    for section in cloneDeep input.sections
      if section.type is 'artworks'
        section.artworks = []
        for artworkId in section.ids
          artwork = _.findWhere fetchedArtworks, _id: artworkId
          if artwork
            section.artworks.push denormalizedArtworkData artwork
          else
            section.ids = _.without section.ids, artworkId
        # Section shouldn't be added if there are no artworks
        section = {} if section.artworks.length is 0
      newSections.push section unless _.isEmpty section
    article.sections = newSections
    cb(null, article)

denormalizedArtworkData = (artwork) ->
  Artwork = Backbone.Model.extend ArtworkHelpers
  artwork = new Artwork artwork
  denormalizedArtwork =
    id: artwork.get('_id')
    slug: artwork.get('id')
    date: artwork.get('date')
    title: artwork.get('title')
    image: artwork.imageUrl()
    partner:
      name: getPartnerName artwork
      slug: getPartnerLink artwork
    artist:
      name: artwork.get('artist').name or _.compact(artwork.get('artists').pluck('name'))[0] or ''
      slug: artwork.get('artist').id

getPartnerName = (artwork) ->
  if artwork.get('collecting_institution')?.length > 0
    artwork.get('collecting_institution')
  else if artwork.get('partner')
    artwork.get('partner').name
  else
    ''

getPartnerLink = (artwork) ->
  partner = artwork.get('partner')
  return unless partner and partner.type isnt 'Auction'
  if partner.default_profile_public and partner.default_profile_id
    return partner.default_profile_id

@sanitizeAndSave = (callback) => (err, article) =>
  return callback err if err
  # Send new content call to Sailthru on any published article save
  if article.published
    @sendArticleToSailthru article, =>
      db.articles.save sanitize(typecastIds article), callback
  else
    db.articles.save sanitize(typecastIds article), callback

@mergeArticleAndAuthor = (input, article, accessToken, cb) =>
  authorId = input.author_id or article.author_id
  User.findOrInsert authorId, accessToken, (err, author) ->
    return cb err if err
    publishing = (input.published and not article.published) or (input.scheduled_publish_at and not article.published)
    article = _.extend article, _.omit(input, 'sections'), updated_at: new Date
    article.sections = [] unless input.sections?.length
    article.author = User.denormalizedForArticle author if author
    cb null, article, author, publishing

# TODO: Create a Joi plugin for this https://github.com/hapijs/joi/issues/577
sanitize = (article) ->
  sanitized = _.extend article,
    title: sanitizeHtml article.title
    thumbnail_title: sanitizeHtml article.thumbnail_title
    lead_paragraph: sanitizeHtml article.lead_paragraph
    sections: for section in article.sections
      section.body = sanitizeHtml section.body if section.type is 'text'
      section.caption = sanitizeHtml section.caption if section.type is 'image'
      section.url = sanitizeLink section.url if section.type is 'video'
      if section.type is 'slideshow'
        for item in section.items when item.type is 'image' or item.type is 'video'
          item.caption = sanitizeHtml item.caption if item.type is 'image'
          item.url = sanitizeLink item.url if item.type is 'video'
      section
  if article.hero_section?.caption
    sanitized.hero_section.caption = sanitizeHtml article.hero_section.caption
  sanitized

sanitizeLink = (urlString) ->
  u = url.parse urlString
  if u.protocol then urlString else 'http://' + u.href

sanitizeHtml = (html) ->
  return xss html unless try $ = cheerio.load html, decodeEntities: false
  $('a').each ->
    if $(this).attr 'href'
      u = sanitizeLink $(this).attr 'href'
      $(this).attr 'href', u
  xss $.html()

typecastIds = (article) ->
  _.extend article,
    # TODO: https://github.com/pebble/joi-objectid/issues/2#issuecomment-75189638
    _id: ObjectId(article._id)
    contributing_authors: article.contributing_authors.map( (author)->
      author.id = ObjectId(author.id)
      author
    ) if article.contributing_authors
    author_id: ObjectId(article.author_id) if article.author_id
    fair_id: ObjectId(article.fair_id) if article.fair_id
    fair_programming_ids: article.fair_programming_ids.map(ObjectId) if article.fair_programming_ids
    fair_artsy_ids: article.fair_artsy_ids.map(ObjectId) if article.fair_artsy_ids
    fair_about_ids: article.fair_about_ids.map(ObjectId) if article.fair_about_ids
    section_ids: article.section_ids.map(ObjectId) if article.section_ids
    auction_id: ObjectId(article.auction_id) if article.auction_id
    partner_ids: article.partner_ids.map(ObjectId) if article.partner_ids
    show_ids: article.show_ids.map(ObjectId) if article.show_ids
    primary_featured_artist_ids: article.primary_featured_artist_ids.map(ObjectId) if article.primary_featured_artist_ids
    featured_artist_ids: article.featured_artist_ids.map(ObjectId) if article.featured_artist_ids
    featured_artwork_ids: article.featured_artwork_ids.map(ObjectId) if article.featured_artwork_ids
    biography_for_artist_id: ObjectId(article.biography_for_artist_id) if article.biography_for_artist_id
    super_article: if article.super_article?.related_articles then _.extend article.super_article, related_articles: article.super_article.related_articles.map(ObjectId) else {}

@sendArticleToSailthru = (article, cb) =>
  images = {}
  tags = article.keywords or []
  tags = tags.concat ['article']
  tags = tags.concat ['artsy-editorial'] if article.author_id is ARTSY_EDITORIAL_ID
  tags = tags.concat ['magazine'] if article.featured is true
  imageSrc = article.email_metadata?.image_url or article.thumbnail_image
  images =
    full: url: crop(imageSrc, { width: 1200, height: 706 } )
    thumb: url: crop(imageSrc, { width: 900, height: 530 } )
  html = if article.send_body then getTextSections(article) else ''
  sailthru.apiPost 'content',
    url: "#{FORCE_URL}/article/#{_.last(article.slugs)}"
    date: article.published_at
    title: article.email_metadata?.headline or article.thumbnail_title
    author: article.email_metadata?.author or article.author?.name
    tags: tags
    images: images
    spider: 0
    vars:
      credit_line: article.email_metadata?.credit_line
      credit_url: article.email_metadata?.credit_url
      html: html
      custom_text: article.email_metadata?.custom_text
  , (err, response) =>
    debug err if err
    cb()

getTextSections = (article) ->
  condensedHTML = ""
  for section in article.sections when section.type is 'text'
    condensedHTML = condensedHTML.concat section.body
  condensedHTML
