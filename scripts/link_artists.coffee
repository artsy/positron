#
# A script that finds unlinked instances of artist names and adds links.
# Currently just run locally to support the Growth team once in a while.
#
# IMPORTANT: This script is a WIP, we still need to look at edge cases like
# noticing when an unlinked artist name is inside of another link. DO NOT
# run this in production yet.
#

require('node-env-file')(require('path').resolve __dirname, '../.env')
db = require '../api/lib/db'
async = require 'async'
cheerio = require 'cheerio'
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'
request = require 'superagent'
artsyXapp = require 'artsy-xapp'
fs = require 'fs'
{ ObjectId } = require 'mongojs'
ARTSY_URL = process.env.ARTSY_URL
API_URL = process.env.API_URL
ARTSY_ID = process.env.ARTSY_ID
ARTSY_SECRET = process.env.ARTSY_SECRET

# Upload an array of artist names to search for in this directory
# + create of array of artist names/display names/ids
ARTISTLIST = require './artist_list.coffee'
artistNames = fs.readFileSync(__dirname + '/tmp/artist_names.txt').toString().split('\n')
artists = _.zip(ARTISTLIST.map(_s.slugify), artistNames)

# Run all published articles
db.articles.find({ published: true }).toArray (err, articles) ->
  return exit err if err
  async.map(articles, checkLinks, (err, results) ->
    console.log 'all finished'
    process.exit()
  )

checkLinks = (article, cb) ->
  return cb() unless article
  texts = (section.body for section in article.sections \
    when section.type is 'text').join('') + article.lead_paragraph
  $ = cheerio.load texts
  html = $.html()
  #check article for unlinked mentions of each artist in artist list
  for artist in artists
    # check whether name appears in article without a link or with a link to Google
    if findUnlinked html, artist
      # replace first mention of name in text w/ name + artsy link
      if findUnlinked article.lead_paragraph, artist
        article.lead_paragraph = addLink article.lead_paragraph, artist
      else
        for section in article.sections when section.type is 'text'
          if findUnlinked section.body, artist
            section.body = addLink section.body, artist
  db.articles.save article, cb

findUnlinked = (text, artist) ->
  nameLinks = _s.count text, artist[1] + '</a>'
  nameMentions = _s.count text, artist[1]
  return true if nameLinks is 0 && nameMentions > 0

addLink = (text, artist) ->
  link = "<a href=\"https://artsy.net/artist/#{artist[0]}\">" + artist[1] + "</a>"
  if nextCharacter(text, artist[1]) in ["'", "’"]
    text
  else
    text.replace artist[1], link

nextCharacter = (text, name) ->
  text[text.indexOf(name) + name.length]

exit = (err) ->
  console.error "ERROR", err
  process.exit 1
