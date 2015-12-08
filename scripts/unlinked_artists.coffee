#
# A script that identifies articles that use artist names that aren't linked.
# Currently just run locally to report to the Growth team once and a while.
#
require('node-env-file')(require('path').resolve __dirname, '../.env')
db = require '../api/lib/db'
cheerio = require 'cheerio'
fs = require 'fs'
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'
# upload an array of artist names to search for in this directory
ARTISTS = require './artist_list.coffee'

#Pull all of the articles into memory and extract out their html
db.articles.find({ published: true }).toArray (err, articles) ->
  return exit err if err
  debug "Found #{articles?.length} articles, extracting html..."
  articlesElements = articles.map getHtmlFrom

  # Parse the HTML and find any instances of artist names not inside <a>s
  csv = [['Artist Name', 'Unlinked Articles', 'Unlinked Artsy URLs', 'Total Articles Unlinked', 'Times Unmentioned']]
  csvHash = {}
  # {
  #   "Andy Warhol": {
  #     unlinkedArticles: ['writer.artsy.net/...']
  #     unlinkedArtsyUrls: ['artsy.net/article/...']
  #     totalUnlinked: 5
  #     timesUnmentioned: 10
  #   }
  # }
  for article, i in articles
    unlinkedArtistNamesAndCounts = findUnlinked articlesElements[i]
    for artistName, unmentionedCount of unlinkedArtistNamesAndCounts
      csvHash[artistName] ?= { unlinkedArticles: [], unlinkedArtsyUrls: [], totalUnlinked: 0, timesUnmentioned: 0 }
      csvHash[artistName].unlinkedArticles.push(
        "http://writer.artsy.net/articles/#{article._id}/edit"
      )
      csvHash[artistName].unlinkedArtsyUrls.push(
        "http://artsy.net/article/#{article.slugs.slice(-1)[0]}"
      )
      csvHash[artistName].timesUnmentioned += unmentionedCount
    debug "Searched #{i + 1 * 1000} articles..." if i % 1000 is 0
  for artistName, data of csvHash
    csv.push [
      artistName
      data.unlinkedArticles.join(' | ')
      data.unlinkedArtsyUrls.join(' | ')
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
  html = $.html().toLowerCase()
  for name in ARTISTS
    nameLink = 'artsy.net/artist/' + name.toLowerCase().split(' ').join('-')
    # if name appears in article without a link
    if (_s.count html, nameLink) is 0 && (_s.count html, name) > 0
      namesAndCounts[name] = _s.count html, name
  namesAndCounts

getHtmlFrom = (article) ->
  texts = (section.body for section in article.sections \
    when section.type is 'text').join('') + article.lead_paragraph
  $ = cheerio.load texts

exit = (err) ->
  console.error "ERROR", err
  process.exit 1