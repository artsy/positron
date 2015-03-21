#
# Migrates old gravity posts into the new article format.
#

require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
debug = require('debug')('cron:migrate')
_ = require 'underscore'
{ resolve } = require 'path'
async = require 'async'
cheerio = require 'cheerio'
moment = require 'moment'
glossary = require('glossary')(minFreq: 2, collapse: true, blacklist: [
  'art', 'I', 'sy', 'work', 'love', 'works', 'views', 'study', 'post', 'share'
])
User = require '../apps/users/model'
{ ObjectId } = mongojs = require 'mongojs'
{ GRAVITY_MONGO_URL, GRAVITY_CLOUDFRONT_URL } = process.env
gravity = null
db = null

module.exports = (callback = ->) ->
  return callback new Error('No GRAVITY_MONGO_URL') unless GRAVITY_MONGO_URL?
  setup (err) ->
    return callback err if err
    migrateOldPosts callback

setup = (callback) ->
  # Load the Positron & Gravity databases
  db = require './db'
  gravity = mongojs GRAVITY_MONGO_URL, ['posts', 'post_artist_features',
    'post_artwork_features', 'artworks', 'profiles', 'fair_organizers', 'fairs',
    'partners', 'reposts']
  debug "Connecting to databases and beginning migrate..."
  # Make sure both databases are a go first.
  async.parallel [
    (cb) -> db.articles.count {}, cb
    (cb) -> gravity.posts.count {}, cb
  ], callback

migrateOldPosts = (callback) ->
  # Find published posts from Gravity's db that don't exist in Positron and
  # convert them to articles.
  db.articles.distinct 'gravity_id', {}, (err, ids) ->
    return callback err if err
    ids = (ObjectId(id.toString()) for id in _.compact ids)
    gravity.posts.find { published: true, _id: $nin: ids }, (err, posts) ->
      debug "Converting #{posts.length} new posts into articles..."
      postsToArticles posts, callback

findPostProfiles = (post, profileType, callback) ->
  async.parallel [
    (cb) ->
      gravity.profiles.findOne {
        _id: post.profile_id, owner_type: profileType
      }, cb
    (cb) ->
      gravity.reposts.find { post_id: post._id }, (err, reposts) ->
        return cb err if err
        gravity.profiles.find({
          _id: { $in: _.pluck(reposts, 'profile_id') }
          owner_type: profileType
        }, cb)
  ], (err, [postProfile, repostProfiles]) ->
    return callback err if err
    profiles = _.compact [postProfile].concat repostProfiles
    return callback() unless profiles.length
    callback null, profiles

bestThumbnail = (attachments, artworks) ->
  return null unless attachments?.length
  artworkUrls = _.compact(
    for attachment in _.where(attachments, _type: 'PostArtwork')
      artwork = _.select(artworks, (artwork) ->
        attachment.artwork_id.toString() is artwork._id.toString()
      )[0]
      img = artwork?.additional_images?[0]
      _.compact([
        img?.image_urls?.large
        _.sample(img?.image_urls ? [])
        artwork?.image_urls?.large
        _.sample(artwork?.image_urls ? [])
        (("http://static.artsy.net/additional_images/#{img._id}/" +
         "#{if v = img.image_version then v + '/' else ''}" +
         "large.jpg") if img)
      ])[0]
  )
  imageUrls = _.compact(
    for attachment in _.where(attachments, _type: 'PostImage')
      "#{GRAVITY_CLOUDFRONT_URL}/post_images/#{attachment._id}/large.jpg"
  )
  linkUrls = _.compact(
    for attachment in _.where(attachments, _type: 'PostLink')
      attachment.oembed_json?.thumbnail_url or attachment.oembed_json?.url
  )
  imageUrls[0] or linkUrls[0] or artworkUrls[0] or null

slideshowSections = (post, bodyText) ->
  slideshowItems = _.compact(for attachment in (post.attachments or [])
    switch attachment._type
      when 'PostArtwork'
        {
          type: 'artwork'
          id: attachment.artwork_id
        }
      when 'PostImage'
        {
          type: 'image'
          url: "#{GRAVITY_CLOUDFRONT_URL}/post_images/" +
            "#{attachment._id}/larger.jpg"
        }
      when 'PostLink'
        if attachment.url?.match /youtube|vimeo/
          {
            type: 'video'
            url: attachment.url
          }
        else if attachment.url?.match /jpeg|jpg|png|gif/
          {
            type: 'image'
            url: attachment.url
          }
  )
  itemTypes = _.uniq(_.pluck slideshowItems, 'type').join('')
  sections = (
    if (slideshowItems.length <= 3 and itemTypes is 'artwork')
      [{
        type: 'artworks'
        ids: _.pluck(slideshowItems, 'id')
        layout: 'overflow_fillwidth'
      }]
    else if slideshowItems.length is 1
      switch (item = slideshowItems[0]).type
        when 'image' then [{ type: 'image', url: item.url }]
        when 'video' then [{ type: 'video', url: item.url }]
    else
      [{ type: 'slideshow', items: slideshowItems }]
  )
  sections.push { type: 'text', body: post.body } if bodyText
  sections

postsToArticles = (posts, callback) ->
  return callback() unless posts.length
  debug "Migrating #{posts.length} posts...."
  # Fetch any artist/artwork features + the post's first artwork and begin
  # mapping posts -> articles
  async.map posts, ((post, callback) ->
    $ = cheerio.load post.body if post.body
    bodyText = $?('*').text()
    async.parallel [
      # Featured artists
      (cb) ->
        gravity.post_artist_features.find(post_id: post._id).toArray cb
      # Featured artworks
      (cb) ->
        gravity.post_artwork_features.find(post_id: post._id).toArray cb
      # Embedded artworks
      (cb) ->
        artworkIds = (ObjectId(a.artwork_id) for a in (post.attachments or []) \
          when a._type is 'PostArtwork')
        return cb() unless artworkIds.length
        gravity.artworks.find { _id: $in: artworkIds }, cb
      # Related fair
      (cb) ->
        findPostProfiles post, 'Fair', (err, profiles) ->
          return cb err if err
          gravity.fairs.findOne({ _id: $in: _.pluck(profiles, 'owner_id') }, cb)
      # Related partners
      (cb) ->
        findPostProfiles post, 'PartnerGallery', (err, profiles) ->
          return cb err if err
          gravity.partners.find(
            { _id: $in: _.pluck(profiles, 'owner_id') }, cb
          )
      # Author
      (cb) ->
        User.find post.author_id, cb
    ], (err, results) ->
      [artistFeatures, artworkFeatures, artworks, fair, partners, author] = results
      # Map Gravity data into a Positron schema
      data =
        _id: post._id
        slugs: [post._id.toString()].concat(post._slugs)
        author_id: ObjectId(post.author_id)
        author: User.denormalizedForArticle(author) if author
        thumbnail_title: post.title
        thumbnail_teaser: $?('p')?.first()?.text()
        thumbnail_image: bestThumbnail(post.attachments, artworks)
        title: post.title
        published: post.published
        published_at: moment(post.published_at).toDate()
        updated_at: moment(post.updated_at).toDate()
        sections: slideshowSections(post, bodyText)
        featured_artist_ids: (f.artist_id for f in artistFeatures or [])
        featured_artwork_ids: (f.artwork_id for f in artworkFeatures or [])
        gravity_id: post._id
        fair_id: fair?._id
        partner_ids: _.pluck(partners, '_id') if partners?.length
        tier: 2
        migrated_from_gravity: true
      # Callback with mapped data
      debug "Mapped #{_.last post._slugs}"
      callback? null, data
  ), (err, articles) ->
    return callback(err) if err
    # Bulk update the mapped articles into Positron
    bulk = db.articles.initializeOrderedBulkOp()
    bulk.insert(article) for article in articles
    bulk.execute (err, res) -> callback err, articles

return unless module is require.main
module.exports (err) ->
  if err
    debug err
    process.exit 1
  else
    debug "All done."
    process.exit()
