#
# A script that identifies articles that use artist names that aren't linked.
# Currently just run locally to report to the Growth team once and a while.
#
# Requires importing an artists collection into Positron from Gravity.
# mongodump -d gravity_development -c artists -o ./scripts/tmp
# mongorestore -d positron -c artists ./scripts/tmp/gravity_development/artists.bson
#
require('node-env-file')(require('path').resolve __dirname, '../.env')
db = require '../api/lib/db'
cheerio = require 'cheerio'
csv = require 'fast-csv'
fs = require 'fs'
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'
artists = require './artist_list.coffee'

# Setup CSV
filename = "export_" + moment().format('YYYYMMDDhhmmss') + ".csv"
csvStream = csv.createWriteStream { headers: true }
dir = 'scripts/tmp/'

writableStream = fs.createWriteStream( dir + filename)

csvStream.pipe(writableStream)
csvStream.write(['Writer URL', 'Artsy URL', '# of missing links']

db.articles.find(
  { published: true }
  (err, articles) ->
    return exit err if err
    unlinkedTotal = 0
    debug "Found #{articles?.length} articles, extracting html..."
    articlesHtmls = articles.map getHtmlFrom
    articlesWithUnlinkedNames = _.compact _.flatten(
      for article, i in articles
        unlinkedArtistSlugs = findUnlinked artists, articlesHtmls[i]
        debug "Searched #{i + 1 * 1000} articles..." if i % 1000 is 0
        if unlinkedArtistSlugs.length
          { id: article._id, artsyUrl: article.slugs.slice(-1)[0], slugs: unlinkedArtistSlugs }
          unlinkedTotal = unlinkedTotal + (unlinkedArtistSlugs.length)
        else
          null
    )
    debug "Total artist mentions without link: #{unlinkedTotal}"
    debug "DONE"
    for data in articlesWithUnlinkedNames
      debug "Article #{data.id} is missing links to #{data.slugs.join ', '}"
    for artist in artists
      count = 0
      for i in [0...articlesWithUnlinkedNames.length]
        if articlesWithUnlinkedNames[i] == artist
          count++
      { id: artist, unlinkedCount: count }
    process.exit()
)

findUnlinked = (artists, articlesHtml) ->
  slugs = []
  for artist, i in artists
    if articlesHtml.indexOf(name) >= 0
      slugs.push artist._slugs[0]
  slugs

getHtmlFrom = (article) ->
  texts = (section.body for section in article.sections \
    when section.type is 'text').join('')
  $ = cheerio.load texts
  $('a').remove()
  $.html()

exit = (err) ->
  console.error "ERROR", err
  process.exit 1
