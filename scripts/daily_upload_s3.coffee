#
# A script that collects article data from our mongo database, creates a CSV document,
# and sends that data to S3 for consumption by Fulcrum.
#

knox = require 'knox'
Q = require 'bluebird-q'
mongojs = require 'mongojs'
csv = require 'fast-csv'
fs = require 'fs'
path = require 'path'
moment = require 'moment'

# Setup environment variables
env = require 'node-env-file'
switch process.env.NODE_ENV
  when 'test' then env path.resolve __dirname, '../.env.test'
  when 'production', 'staging' then ''
  else env path.resolve __dirname, '../.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

# Setup CSV
filename = "export_" + moment().format('YYYYMMDDhhmmss') + ".csv"
csvStream = csv.createWriteStream { headers: true }
dir = 'scripts/tmp/'

writableStream = fs.createWriteStream( dir + filename)

csvStream.pipe(writableStream)
csvStream.write(["id", "author_id", "auction_id", "contributing_authors", "fair_id", "featured", "featured_artist_ids", "featured_artwork_ids", "partner_ids", "primary_featured_artist_ids", "slugs", "tags", "title", "tier", "published_at","show_ids","section_ids","thumbnail_image","thumbnail_title"])

db.articles.find({ published: true })
  .on('data', (doc) ->
    if doc
      published_at = if doc.published_at then moment(doc.published_at).format('YYYYMMDDhhmmss') + " EST" else ''
      csvStream.write([doc._id, doc.author_id, doc.auction_id, doc.contributing_authors, doc.fair_id, doc.featured, doc.featured_artist_ids, doc.featured_artwork_ids, doc.partner_ids, doc.primary_featured_artist_ids, doc.slugs, doc.tags, doc.title, doc.tier, published_at, doc.show_ids, doc.section_ids, doc.thumbnail_image, doc.thumbnail_title])
  ).on 'end', ->

    # End Streaming
    csvStream.end()

    # Setup S3 Client
    client = knox.createClient
      key: process.env.S3_KEY
      secret: process.env.S3_SECRET
      bucket: process.env.FULCRUM_BUCKET

    client.putFile dir + filename, "reports/positron_articles/#{filename}", {
      'Content-Type': 'text/csv'
    }, (err, result) ->

      # Delete filename and close db
      fs.unlink(dir + filename)
      db.close()
