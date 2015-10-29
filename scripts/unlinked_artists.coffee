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
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'

db.articles.find({ published: true }).sort(updated_at: -1).toArray (err, articles) ->
  return exit err if err
  debug "Found #{articles?.length} articles, extracting html..."
  articlesHtmls = articles.map getHtmlFrom
  db.artists.find (err, artists) ->
    return exit err if err
    debug "Found #{artists?.length} artists..."
    articlesWithUnlinkedNames = _.compact _.flatten(
      for article, i in articles
        unlinkedArtistSlugs = findUnlinked artists, articlesHtmls[i]
        debug "Searched #{i + 1 * 1000} articles..." if i % 1000 is 0
        if unlinkedArtistSlugs.length
          { id: article._id, slugs: unlinkedArtistSlugs }
        else
          null
    )
    debug "DONE"
    for data in articlesWithUnlinkedNames
      debug "Article #{data.id} is missing links to #{data.slugs.join ', '}"
    process.exit()

findUnlinked = (artists, articlesHtml) ->
  slugs = []
  for artist, i in artists
    name = (artist.first?.trim() or '') + ' ' + (artist.last?.trim() or '')
    if name.trim() and articlesHtml.indexOf(name) >= 0
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
  proces.exit 1
