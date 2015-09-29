knox = require 'knox'
mongojs = require 'mongojs'
csv = require 'fast-csv'
fs = require 'fs'
path = require 'path'
moment = require 'moment'

# Setup environment variables
env = require 'node-env-file'
env __dirname + '/.env'

# Connect to database
db = mongojs(process.env.MONGOHQ_URL, ['articles'])

# Write to CSV
filename = "export_" + moment().format('YYYYMMDDhhmmss') + ".csv"
csvStream = csv.createWriteStream { headers: true }
writableStream = fs.createWriteStream(filename)

csvStream.pipe(writableStream)
csvStream.write(["id", "author_id", "auction_id", "contributing_authors", "fair_id", "featured", "featured_artist_ids", "featured_artwork_ids", "partner_ids", "primary_featured_artist_ids", "slugs", "tags", "title", "tier", "published_at","show_ids","section_ids","thumbnail_image","thumbnail_title", "thumbnail_teaser"])


db.articles.find({ published: true }).forEach((err, doc) ->
  csvStream.write([doc.id, doc.author_id, doc.auction_id, doc.contributing_authors, doc.fair_id, doc.featured, doc.featured_artist_ids, doc.featured_artwork_ids, doc.partner_ids, doc.primary_featured_artist_ids, doc.slugs, doc.tags, doc.title, doc.tier, doc.published_at, doc.show_ids, doc.section_ids, doc.thumbnail_image, doc.thumbnail_title, doc.thumbnail_teaser])
, ->
  csvStream.end()
)


# Setup S3 Client
# client = knox.createClient
#   key: process.env.S3_KEY
#   secret: process.env.S3_SECRET
#   bucket: process.env.FULCRUM_BUCKET

# Delete filename
