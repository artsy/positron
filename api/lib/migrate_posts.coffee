# 
# Migrates old gravity posts into the new article format.
# 

env = require 'node-env-file'
{ resolve } = require 'path'
env resolve __dirname, '../../.env'
async = require 'async'
cheerio = require 'cheerio'
moment = require 'moment'
{ ObjectId } = mongojs = require 'mongojs'
{ GRAVITY_MONGO_URL, GRAVITY_CLOUDFRONT_URL } = process.env
db = require './db'

console.log GRAVITY_MONGO_URL
gravity = mongojs GRAVITY_MONGO_URL, ['posts', 'post_artist_features',
  'post_artwork_features']

gravity.posts.find().toArray (err, posts) ->
  console.log err, posts.length
  async.each posts, ((post, callback) ->
    async.parallel [
      (cb) -> gravity.post_artist_features.find(_id: post._id).toArray cb
      (cb) -> gravity.post_artwork_features.find(_id: post._id).toArray cb
    ], (err, results) ->
      featuredArtistIds = (feature.artist_id for feature in results[0])
      featuredArtworkIds = (feature.artist_id for feature in results[1])
      a = post.attachments[0]
      $ = cheerio.load post.body
      data =
        author_id: ObjectId(post.author_id)
        thumbnail_title: post.title
        thumbnail_teaser: $('p').first().html()
        thumbnail_image: switch a._type
          when 'PostImage' then "#{GRAVITY_CLOUDFRONT_URL}/#{a._id}/larger.jpg"
          when 'PostLink' then a.oembed_json.thumbnail_url or a.oembed_json.url
        title: post.title
        published: post.published
        published_at: moment(post.published_at).format()
        updated_at: moment(post.updated_at).format()
        sections: for a in post.attachments
          switch a._type
            when 'PostArtwork'
              {
                type: 'artworks'
                ids: [a.  when a._type is 'PostArtwork']
                layout: 'column_width'
              }
            when 'PostImage'
              {
                type: 'image'
                url: a.oembed_json.thumbnail_url or a.oembed_json.url
              }
            when 'PostLink'
              if a.url?.match /youtube|vimeo/
                {
                  type: 'video'
                  url: a.url
                }
        featured_artist_ids: featuredArtistIds
        featured_artwork_ids: featuredArtworkIds
        gravity_id: post._id
      console.log data, 'moo'
      db.articles.update { gravity_id: post._id }, data, { upsert: true }, callback
  ), (err) ->
    console.warn err