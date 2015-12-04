User = require '../../client/models/user'
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
    email_metadata:
      image_url: 'http://img.png'
      headline: 'Foo'
      credit_line: 'Credit Where Credit Needed'
      credit_url: 'http://credit'
      author: 'Craig Spaeth'
    super_article:
      partner_link: 'http://partnerlink.com'
      partner_logo: 'http://partnerlink.com/logo.jpg'
      partner_link_title: 'Download The App'
      partner_logo_link: 'http://itunes'
      secondary_partner_logo: 'http://secondarypartner.com/logo.png'
      secondary_logo_text: 'In Partnership With'
      secondary_logo_link: 'http://secondary'
      related_articles: [ '5530e72f7261696238050000' ]
  fixtures.users =
    "id" : "4d8cd73191a5c50ce200002a"
    "name" : "Craig Spaeth"
    "type" : "Admin"
    "access_to_partner_ids" : [ ]
    "profile_handle" : "craig"
    "profile_id" : "5086df098523e60002000012"
    "profile_icon_url" : "https://d32dm0rphc51dk.cloudfront.net/CJOHhrln8lwVAubiMIIYYA/square140.png"
    "access_token" : "$2a$10$PJrPMBadu1NPdmnshBgFbeZrE3WtYoIoLoeII0mZDqOnatcOdamke"
  fixtures.sections =
    'id': '55356a9deca560a0137aa4b7'
    'title': 'Vennice Biennalez'
    'description': 'The coolest biennale'
    'slug': 'vennice-biennale'
    'partner_logo_url': 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
    'thumbnail_url': 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
    'featured_article_ids': [ '5522d03ae8e369060053d953' ]
  fixtures.brandPartners =
    id: '559ff9706b69f6a086a65633'
    partner_id: '559ff9706b69f6a086a65632'
    featured_links: [
      {
        thumbnail_url: 'http://goo.com/img.jpg'
        headline: 'Fascinating Article'
        subheadline: 'Featured Artist'
        description: 'Hello World'
      }
    ]
  fixtures.locals =
    asset: ->
    user: new User fixtures.users
    sd:
      PATH: '/'
      URL: '/'
    moment: require 'moment'
    sharify:
      script: -> '<script>var sharify = {}</script>'
    crop: (url) -> url
    resize: (url) -> url
    fill: (url) -> url
  fixtures
