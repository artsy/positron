#
# Migrates old gravity posts into the new article format.
#

require('node-env-file')("#{process.cwd()}/.env") unless process.env.NODE_ENV?
_ = require 'underscore'
{ resolve } = require 'path'
async = require 'async'
cheerio = require 'cheerio'
moment = require 'moment'
glossary = require('glossary')(minFreq: 2, collapse: true, blacklist: [
  'art', 'I', 'sy', 'work', 'love', 'works', 'views', 'study', 'post', 'share'
])
{ ObjectId } = mongojs = require 'mongojs'
{ GRAVITY_MONGO_URL, GRAVITY_CLOUDFRONT_URL } = process.env

# Load the Positron & Gravity databases
db = require './db'
gravity = mongojs GRAVITY_MONGO_URL, ['posts', 'post_artist_features',
  'post_artwork_features', 'artworks']

module.exports = (callback) ->

  # Time it
  start = moment()

  # Remove any posts with slideshows & gravity_ids b/c we know those originated
  # in Gravity and will be replaced.
  query = {'sections.0.type': 'slideshow', gravity_id: { $ne: null } }
  db.articles.remove query, (err) ->
    return callback err if err

    # Find published posts from Gravity's db that weren't created in Positron
    # and map them into Positron articles in batches of 1000 at a time to
    # keep memory consumption low.
    db.articles.distinct 'gravity_id', {}, (err, ids) ->
      return callback err if err
      ids = (ObjectId(id.toString()) for id in _.compact ids)
      gravity.posts.count { published: true, _id: $nin: ids }, (err, count) ->
        async.timesSeries Math.ceil(count / 1000), ((n, next) ->
          gravity.posts
            .find(published: true, _id: $nin: ids)
            .skip(n * 1000).limit(1000)
            .toArray (err, posts) ->
              return cb(err) if err
              postsToArticles posts, (err) ->
                # Small pause inbetween for the GC to catch up
                setTimeout (-> next err), 100
        ), (err) ->
          console.log "All done! Started migration #{start.from(moment())}. " +
            "Took #{moment().diff(start)}ms"
            callback err

postsToArticles = (posts, callback) ->
  return callback() unless posts.length
  console.log "Migrating #{posts.length} posts...."

  # Fetch any artist/artwork features + the post's first artwork and begin
  # mapping posts -> articles
  async.map posts, ((post, callback) ->
    $ = cheerio.load post.body if post.body
    bodyText = $?('*').text()
    queries = [
      (cb) -> gravity.post_artist_features.find(post_id: post._id).toArray cb
      (cb) -> gravity.post_artwork_features.find(post_id: post._id).toArray cb
    ]
    if post.attachments?[0]?._type is 'PostArtwork'
      queries.push (cb) ->
        gravity.artworks.findOne { _id: post.attachments?[0].artwork_id }, cb
    async.parallel queries, (err, results) ->
      [artistFeatures, artworkFeatures, artwork] = results

      # Map Gravity data into a Positron schema
      data =
        _id: post._id
        slugs: post._slugs
        author_id: ObjectId(post.author_id)
        thumbnail_title: post.title
        thumbnail_teaser: $?('p')?.first()?.text()
        thumbnail_image: (
          switch post.attachments?[0]?._type
            when 'PostArtwork'
              img = artwork?.additional_images?[0]
              if img
                "http://static.artsy.net/additional_images/#{img._id}/" +
                "#{if v = img.image_version then v + '/' else ''}large.jpg"
              else
                artwork?.image_urls?.large or artwork?.image_urls?[0]
            when 'PostImage'
              "#{GRAVITY_CLOUDFRONT_URL}/post_images/" +
              "#{post.attachments?[0]?._id}/large.jpg"
            when 'PostLink'
              (
                post.attachments?[0]?.oembed_json?.thumbnail_url or
                post.attachments?[0]?.oembed_json?.url
              )
        )
        tags: (
          tags = (term for term in glossary.extract bodyText \
            when term.length > 3 and not term.match('@')) if bodyText
          tags ?= []
          tags.concat 'Migrated Post'
        )
        title: post.title
        published: post.published
        published_at: moment(post.published_at).format()
        updated_at: moment(post.updated_at).format()
        sections: (
          slideshowItems = _.compact(for attachment in (post.attachments or [])
            switch attachment?._type
              when 'PostArtwork'
                {
                  type: 'artwork'
                  id: attachment?.artwork_id
                }
              when 'PostImage'
                {
                  type: 'image'
                  url: "#{GRAVITY_CLOUDFRONT_URL}/post_images/" +
                    "#{attachment?._id}/larger.jpg"
                }
              when 'PostLink'
                if attachment?.url?.match /youtube|vimeo/
                  {
                    type: 'video'
                    url: attachment.url
                  }
                else if attachment?.url?.match /jpeg|jpg|png|gif/
                  {
                    type: 'image'
                    url: attachment.url
                  }
          )
          sections = [{ type: 'slideshow', items: slideshowItems }]
          sections.push { type: 'text', body: post.body } if bodyText
          sections
        )
        featured_artist_ids: (f.artist_id for f in artistFeatures)
        featured_artwork_ids: (f.artwork_id for f in artworkFeatures)
        gravity_id: post._id

      # Callback with mapped data
      console.log "Mapped #{_.last post._slugs}"
      callback null, data
  ), (err, articles) ->
    return callback(err) if err

    # Bulk update the mapped articles into Positron
    bulk = db.articles.initializeOrderedBulkOp()
    bulk.insert(article) for article in articles
    bulk.execute (err, res) -> callback err, articles

return unless module is require.main
module.exports (err) ->
  console.warn err
  process.exit 1
