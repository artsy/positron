#
# A script that finds unlinked instances of artist names and adds links.
# Currently just run locally to report to the Growth team once and a while.
#
require('node-env-file')(require('path').resolve __dirname, '../.env')
db = require '../api/lib/db'
cheerio = require 'cheerio'
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'
# upload an array of artist names to search for in this directory
ARTISTS = require './artist_list.coffee'

#Pull all of the articles into memory and extract their html
db.articles.find({ published: true }).toArray (err, articles) ->
  return exit err if err
  debug "Found #{articles?.length} articles, extracting html..."
  articlesElements = articles.map getHtmlFrom

  for article, i in articles
    addLinks articlesElements[i]
    debug "Searched #{i + 1 * 1000} articles..." if i % 1000 is 0
  
  debug 'CSV written'
  process.exit()

addLinks = ($) ->
  namesAndCounts = {}
  html = $.html()
  for name in ARTISTS
    nameLink = name + '</a>'
    artsyLink = 'artsy.net/artist/' + name.toLowerCase().split(' ').join('-')
    # if name appears in article without a link or with a link to Google
    if (_s.count html, nameLink) is 0 && (_s.count html, name) > 0
      # replace first mention of name in text w/ name + artsy link
      html.replace name, "<a href=\"https://artsy.net/artist\">Sam Gaskin</a>"
  namesAndCounts

# need to iterate over lead paragraph, see if name appears. if so, replace and save. if not, iterate over text sections and do the same

getHtmlFrom = (article) ->
  texts = (section.body for section in article.sections \
    when section.type is 'text').join('') + article.lead_paragraph
  $ = cheerio.load texts

# this will fuck formatting for names like de Kooning
# makeTitleCase = (name) ->
#   name.replace(/(?:^|\s|-)\S/g, (c) -> c.toUpperCase())

exit = (err) ->
  console.error "ERROR", err
  process.exit 1