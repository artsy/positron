CurrentUser = require '../../client/models/current_user'
{ ObjectId } = require 'mongojs'
moment = require 'moment'

timeCount = 0

module.exports = ->
  timeCount++
  fixtures = {}
  fixtures.articles =
    id: '54276766fd4f50996aeca2b8'
    author_id: ObjectId('4d8cd73191a5c50ce210002a')
    thumbnail_title: 'Top Ten Booths at miart 2014',
    thumbnail_teaser: 'Look here! Before the lines start forming...',
    thumbnail_image: 'http://kitten.com',
    tier: 1,
    tags: ['Fair Coverage', 'Magazine']
    title: 'Top Ten Booths',
    lead_paragraph: 'Just before the lines start forming...',
    published: true,
    published_at: moment().add(timeCount, 'seconds').format(),
    updated_at: moment().add(timeCount, 'seconds').format(),
    sections: [
      {
        type: 'slideshow',
        items: [
          { type: 'artwork', id: '54276766fd4f50996aeca2b8' }
          { type: 'image', url: '', caption: '' }
          { type: 'video', url: ''  }
        ]
      }
      {
        type: 'image',
        url: 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
      }
      {
        type: 'text',
        body: '<p><h1>10. Lisson Gallery</h1></p><p>Mia Bergeron merges the <em>personal</em> and <em>universal</em>...',
      }
      {
        type: 'artworks',
        ids: ['5321b73dc9dc2458c4000196', '5321b71c275b24bcaa0001a5'],
        layout: 'overflow_fillwidth'
      }
      {
        type: 'text',
        body: 'Check out this video art:',
      }
      {
        type: 'video',
        url: 'http://youtu.be/yYjLrJRuMnY'
      }
    ]
    primary_featured_artist_ids: ['5086df098523e60002000012']
    featured_artist_ids: ['5086df098523e60002000012']
    featured_artwork_ids: ['5321b71c275b24bcaa0001a5']
    gravity_id: '502a6debe8b6470002000004'
    featured: false
  fixtures.users =
    "id": "502a6debe8b6470002000004"
    "access_token": "test-access-token",
    "user": {
      "name": "Craig Spaeth",
    },
    "profile": {
      "id": "5086df098523e60002000012",
      "created_at": "2012-10-23T18:16:41+00:00",
      "updated_at": "2014-09-24T20:38:41+00:00",
      "handle": "craig",
      "location": "New York, New York",
      "description": "Developer at Artsy. My heart swoons for code, art, & indie games.",
      "image_versions": [
        "square140"
      ],
    },
    "details": {
      "id": "4d8cd73191a5c50ce200002a",
      "created_at": "2011-07-18T17:53:47+00:00",
      "updated_at": "2014-10-03T01:59:14+00:00",
      "type": "Admin",
      "email": "craig@artsymail.com",
      "birthday": null,
      "phone": "",
      "gender": null
    }
    "icon_urls": {
      "square140": "https://d32dm0rphc51dk.cloudfront.net/CJOHhrln8lwVAubiMIIYYA/square140.jpg"
      "large": "https://d32dm0rphc51dk.cloudfront.net/CJOHhrln8lwVAubiMIIYYA/large.jpg"
    }
  fixtures.verticals =
    'id': '55356a9deca560a0137aa4b7'
    'title': 'Vennice Biennalez'
    'description': 'The coolest biennale'
    'slug': 'vennice-biennale'
    'partner_logo_url': 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
    'thumbnail_url': 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
    'featured_article_ids': [ '5522d03ae8e369060053d953' ]
  fixtures.locals =
    asset: ->
    user: new CurrentUser fixtures.users
    sd:
      PATH: '/'
    moment: require 'moment'
    sharify:
      script: -> '<script>var sharify = {}</script>'
    crop: (url) -> url
    resize: (url) -> url
    fill: (url) -> url
  fixtures
