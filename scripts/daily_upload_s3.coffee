#
# A script that collects article data from our mongo database, creates a CSV document,
# and sends that data to S3 for consumption by Fulcrum.
#

knox = require 'knox'
mongojs = require 'mongojs'
fs = require 'fs'
path = require 'path'
moment = require 'moment'
{ pluck, object } = require 'underscore'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

# Setup file naming
filename = "export_" + moment().format('YYYYMMDDhhmmss') + ".csv"
dir = 'scripts/tmp/'

attrs = ['id', 'author_id', 'auction_ids', 'contributing_authors', 'fair_ids', 'featured', 'featured_artist_ids', 'featured_artwork_ids', 'partner_ids', 'primary_featured_artist_ids', 'slugs', 'tags', 'title', 'tier', 'published_at', 'show_ids', 'section_ids', 'thumbnail_image', 'thumbnail_title', 'keywords', 'slug', 'channel_id', 'partner_channel_id']
projections = object attrs, attrs.map -> 1

db.articles.find({ published: true }, projections).toArray (err, articles) ->

  stringify = (arr) ->
    return null unless arr
    str = arr.toString().replace(/"/gi, "'").replace(/\n/gi, "")
    '\"' + str + '\"'

  csv = [ attrs.join(',') ]

  articles.map (a) ->
    published_at = if a.published_at then moment(a.published_at).format('YYYY-MM-DDThh:mm') + "-05:00" else ''
    contributing_authors = stringify(pluck(a.contributing_authors, 'name'))
    row = [
      a._id
      a.author_id
      stringify a.auction_ids
      contributing_authors
      stringify a.fair_ids
      a.featured
      stringify a.featured_artist_ids
      stringify a.featured_artwork_ids
      stringify a.partner_ids
      stringify a.primary_featured_artist_ids
      stringify a.slugs
      stringify a.tags
      stringify a.title
      a.tier
      published_at
      stringify a.show_ids
      stringify a.section_ids
      a.thumbnail_image
      stringify a.thumbnail_title
      stringify a.keywords
      stringify a.slug
      a.channel_id
      a.partner_channel_id
    ].join(',')
    csv.push row

  csv = csv.join('\n')

  fs.writeFile (dir + filename), csv, (err, res) ->

    # Setup S3 Client
    client = knox.createClient
      key: process.env.S3_KEY
      secret: process.env.S3_SECRET
      bucket: process.env.FULCRUM_BUCKET

    client.putFile dir + filename, "reports/positron_articles/#{filename}", {
      'Content-Type': 'text/csv'
    }, (err, result) ->

    # Delete file and close db
      fs.unlink(dir + filename)
      db.close()
