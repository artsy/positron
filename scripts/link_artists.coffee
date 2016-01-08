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
ARTSY_URL = process.env.ARTSY_URL
API_URL = process.env.API_URL
ARTSY_ID = process.env.ARTSY_ID
ARTSY_SECRET = process.env.ARTSY_SECRET
# upload an array of artist names to search for in this directory
ARTISTLIST = require './artist_list.coffee'

# Build array of objects from artist list w/ artist ids + display names (i.e. w/ proper capitalization)
artists = []
artsyXapp.init { url: ARTSY_URL, id: ARTSY_ID, secret: ARTSY_SECRET }, ->
  for artist in ARTISTLIST
    id = artist.toLowerCase().split(' ').join('-')
    console.log artsyXapp.token
    request
      .head("#{ARTSY_URL}/api/v1/artist/#{id}")
      .set('X-XAPP-TOKEN': artsyXapp.token)
      .end (err, sres) => 
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
  nameLinks = _s.count text, artist.name + '</a>' #google hrefs? -- make array of hrefs, stringify, regex for Google?
  nameMentions = _s.count text, artist.name
  possessiveMentions = _s.count text, artist.name + "'"
  # make sure there's a non-possessive instance of the name to which a link can be added
  return true if nameLinks is 0 && nameMentions > 0 && nameMentions > possessiveMentions

addLink = (text, artist, article) ->
  link = "<a href=\"https://artsy.net/artist/#{artist.id}\">" + artist.name + "</a>"
  if nextCharacter text, artist.name is not "'" # any way to look for subsequent non-possessive mentions?
    text.replace artist.name, link
  db.articles.save article

nextCharacter = (text, name) ->
  text[text.indexOf(name) + name.length]

exit = (err) ->
  console.error "ERROR", err
  process.exit 1