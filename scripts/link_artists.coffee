#
# A script that finds unlinked instances of artist names and adds links.
# Currently just run locally to support the Growth team once in a while.
#
require('node-env-file')(require('path').resolve __dirname, '../.env')
db = require '../api/lib/db'
cheerio = require 'cheerio'
_ = require 'underscore'
_s = require 'underscore.string'
debug = require('debug') 'scripts'
request = require 'superagent'
artsyXapp = require 'artsy-xapp'
# upload an array of artist names to search for in this directory
ARTISTLIST = require './artist_list.coffee'

# Build array of objects from artist list w/ artist ids + display names (i.e. w/ proper capitalization)
artists = []
for artist in ARTISTLIST
  id = artist.toLowerCase().split(' ').join('-')
  request.get("#{ARTSY_URL}/api/v1/artist/#{id}")
    .set({'x-xapp-token': artsyXapp.token)
    .end((err, sres) => 
      return next err if err
      name = sres.body.name
  artists.push({id: id, name: name})

db.articles.find({ published: true }).forEach (err, article) ->
  return exit err if err
  checkLinks article
  
  process.exit()

checkLinks = (article) ->
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
        addLink article.lead_paragraph, artist, article
      else
        for section in article.sections when section.type is 'text'
          if findUnlinked section.body, artist
            addLink section.body, artist, article

findUnlinked = (text, artist) ->
  nameLink = artist.name + '</a>' #any way to exclude google hrefs from check?
  return true if (_s.count text, nameLink) is 0 && (_s.count html, artist.name) > 0

addLink = (text, artist, article) ->
  # an absurd means of attempting to ignore possessive mentions
  text.replace (artist.name if text.charAt(text.indexOf(artist.name) + (artist.name).length) is not '\''), "<a href=\"https://artsy.net/artist/#{artist.id}\">" + artist.name + "</a>"
  db.articles.save article

exit = (err) ->
  console.error "ERROR", err
  process.exit 1