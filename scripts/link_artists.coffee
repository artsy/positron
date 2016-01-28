#
# A script that finds unlinked instances of artist names and adds links.
# Currently just run locally to support the Growth team once in a while.
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
# upload an array of artist names to search for in this directory
ARTISTLIST = require './artist_list.coffee'
ARTISTIDS = require './artist_ids.coffee'

artistNames = fs.readFileSync(__dirname + '/tmp/artist_names.txt').toString().split('\n')

#create of array of artist names/display names/ids

artists = _.zip(ARTISTIDS.map(_s.slugify), artistNames)

db.articles.find({ published: true }).skip(110).limit(10).toArray (err, articles) ->
  return exit err if err
  async.map(articles, checkLinks, (err, results) ->
    console.log 'all finished'
    process.exit()
  )
      
    
  

# article = 
#   id: '54276766fd4f50996aeca2b8'
#   author_id: ObjectId('4d8cd73191a5c50ce210002a')
#   thumbnail_title: 'Top Ten Booths at miart 2014',
#   thumbnail_teaser: 'Look here! Before the lines start forming...',
#   thumbnail_image: 'http://kitten.com',
#   tier: 1,
#   tags: ['Fair Coverage', 'Magazine']
#   title: 'Top Ten Booths',
#   lead_paragraph: 'Just before the lines start forming...',
#   published: true,
#   sections: [
#     {
#       type: 'slideshow',
#       items: [
#         { type: 'artwork', id: '54276766fd4f50996aeca2b8' }
#         { type: 'image', url: '', caption: '' }
#         { type: 'video', url: ''  }
#       ]
#     }
#     {
#       type: 'image',
#       url: 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
#     }
#     {
#       type: 'text',
#       body: '<p><h1>10. Lisson Gallery</h1></p><p>Mia Bergeron merges the <em>personal</em> and <em>universal</em>...',
#     }
#     {
#       type: 'artworks',
#       ids: ['5321b73dc9dc2458c4000196', '5321b71c275b24bcaa0001a5'],
#       layout: 'overflow_fillwidth'
#     }
#     {
#       type: 'text',
#       body: 'Check out this video art from Andy Warhol and Willem de Kooning and Jeff Koons dog:',
#     }
#     {
#       type: 'video',
#       url: 'http://youtu.be/yYjLrJRuMnY'
#     }
#   ]
#   primary_featured_artist_ids: ['5086df098523e60002000012']
#   featured_artist_ids: ['5086df098523e60002000012']
#   featured_artwork_ids: ['5321b71c275b24bcaa0001a5']
#   gravity_id: '502a6debe8b6470002000004'
#   featured: false
#   contributing_authors: []
#   email_metadata:
#     image_url: 'http://img.png'
#     headline: 'Foo'
#     credit_line: 'Credit Where Credit Needed'
#     credit_url: 'http://credit'
#     author: 'Craig Spaeth'
#   super_article:
#     partner_link: 'http://partnerlink.com'
#     partner_logo: 'http://partnerlink.com/logo.jpg'
#     partner_link_title: 'Download The App'
#     partner_logo_link: 'http://itunes'
#     partner_fullscreen_header_logo: 'http://partnerlink.com/blacklogo.jpg'
#     secondary_partner_logo: 'http://secondarypartner.com/logo.png'
#     secondary_logo_text: 'In Partnership With'
#     secondary_logo_link: 'http://secondary'
#     footer_blurb: 'This is a Footer Blurb'
#     related_articles: [ '5530e72f7261696238050000' ]


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
      console.log 'article before link: ', article
      # replace first mention of name in text w/ name + artsy link
      if findUnlinked article.lead_paragraph, artist
        article.lead_paragraph = addLink article.lead_paragraph, artist
      else
        for section in article.sections when section.type is 'text'
          if findUnlinked section.body, artist
            section.body = addLink section.body, artist
      console.log 'article after link: ', article
  db.articles.save article, cb

findUnlinked = (text, artist) ->
  nameLinks = _s.count text, artist[1] + '</a>' #google hrefs? -- make array of hrefs, stringify, regex for Google?
  nameMentions = _s.count text, artist[1]
  possessiveMentions = _s.count text, artist[1] + "'"
  # make sure there's a non-possessive instance of the name to which a link can be added
  return true if nameLinks is 0 && nameMentions > 0 && nameMentions > possessiveMentions

addLink = (text, artist) ->
  link = "<a href=\"https://artsy.net/artist/#{artist[0]}\">" + artist[1] + "</a>"
  console.log 'nextCharacter: ', nextCharacter(text, artist[1])
  if nextCharacter(text, artist[1]) in ["'", "’"]
    text
  else
    console.log 'artist link added for: ' + artist[1]
    text.replace artist[1], link
  
nextCharacter = (text, name) ->
  text[text.indexOf(name) + name.length]

exit = (err) ->
  console.error "ERROR", err
  process.exit 1
