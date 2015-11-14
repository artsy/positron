#
# A script that identifies articles that use artist names that aren't linked.
# Currently just run locally to report to the Growth team once and a while.
#
require('node-env-file')(require('path').resolve __dirname, '../.env')
db = require '../api/lib/db'
cheerio = require 'cheerio'
csv = require 'fast-csv'
fs = require 'fs'
moment = require 'moment'
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'
ARTISTS = require './artist_list.coffee'

# Pull all of the articles into memory and extract out their html
db.articles.find({ published: true }).toArray (err, articles) ->
  return exit err if err
  unlinkedTotal = 0
  debug "Found #{articles?.length} articles, extracting html..."
  articlesElements = articles.map getHtmlFrom

  # Parse the HTML and find any instances of artist names no inside <a>s
  csv = [['Artist Name', 'Unlinked Articles', 'Total Articles Unlinked', 'Times Unmentioned']]
  csvHash = {}
  # {
  #   "Andy Warhol": {
  #     unlinkedArticles: ['http']
  #     totalUnlinked: 5
  #     timesUnmentioned: 10
  #   }
  # }
  for article, i in articles
    unlinkedArtistNamesAndCounts = findUnlinked articlesElements[i]
    for artistName, unmentionedCount of unlinkedArtistNamesAndCounts
      csvHash[artistName] ?= { unlinkedArticles: [], totalUnlinked: 0, timesUnmentioned: 0 }
      csvHash[artistName].unlinkedArticles.push(
        "http://writer.artsy.net/articles/#{article._id}/edit"
      )
      csvHash[artistName].timesUnmentioned += unmentionedCount
    debug "Searched #{i + 1 * 1000} articles..." if i % 1000 is 0
  for artistName, data of csvHash
    csv.push [
      artistName
      data.unlinkedArticles.join(' | ')
      data.unlinkedArticles.length
      data.timesUnmentioned
    ]

  # Build up a CSV string and write the file
  csvstring = ''
  csvstring += row.join(',') + '\n' for row in csv
  fs.writeFileSync(__dirname + '/tmp/unlinked_artists.csv', csvstring)
  debug 'CSV written'
  process.exit()

findUnlinked = ($) ->
  namesAndCounts = {}
  for name in ARTISTS
    count = _s.count $.html().toLowerCase(), name
    namesAndCounts[name] = count if count > 0
  namesAndCounts

getHtmlFrom = (article) ->
  texts = (section.body for section in article.sections \
    when section.type is 'text').join('')
  $ = cheerio.load texts
  $('a').remove()
  $

exit = (err) ->
  console.error "ERROR", err
  process.exit 1
