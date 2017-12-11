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
    vertical: {name: 'Culture', id: '55356a9deca560a0137bb4a7'}
    tags: ['Fair Coverage', 'Magazine']
    tracking_tags: ['Newsfeed', 'Video']
    title: 'Top Ten Booths',
    lead_paragraph: '<p>Just before the lines start forming...</p>',
    description: 'Just before the lines start forming, we predict where they will go.',
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
        type: 'image_collection',
        images: [
          type: 'image'
          url: 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
          caption: 'This is a terrible caption'
        ]
      }
      {
        type: 'text',
        body: '<p><h1>10. Lisson Gallery</h1></p><p>Mia Bergeron merges the <em>personal</em> and <em>universal</em>...',
      }
      {
        type: 'image_collection',
        layout: 'overflow_fillwidth'
        images: [
          {
            type: 'artwork'
            title: 'The Four Hedgehogs'
            id: '5321b73dc9dc2458c4000196'
            image: 'https://artsy.net/artwork.jpg'
            partner: name: 'Guggenheim'
            date: '1956'
            artists: [ { name: 'Van Gogh' }, { name: 'Van Dogh' } ]
          }
          {
            type: 'artwork'
            title: 'The Four Hedgehogs 2'
            id: '5321b71c275b24bcaa0001a5'
            image: 'https://artsy.net/artwork2.jpg'
            partner: name: 'Guggenheim'
            date: '1956'
            artists: [ { name: 'Van Gogh' }]
          }
        ]
      }
      {
        type: 'text',
        body: '<p>Check out this video art:</p>',
      }
      {
        type: 'video',
        url: 'http://youtu.be/yYjLrJRuMnY'
      }
      {
        type: 'image_set'
        title: 'The Best Artworks'
        layout: 'mini'
        images: [
          {
            type: 'artwork'
            title: 'The Four Hedgehogs 2'
            id: '5321b71c275b24bcaa0001a5'
            image: 'https://artsy.net/artwork2.jpg'
            partner: name: 'Guggenheim'
            date: '1956'
            artists: [ { name: 'Van Gogh' }]
          }
          {
            type: 'image',
            url: 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
            caption: 'This is a terrible caption'
          }
        ]
      }
    ]
    primary_featured_artist_ids: ['5086df098523e60002000012']
    featured_artist_ids: ['5086df098523e60002000012']
    featured_artwork_ids: ['5321b71c275b24bcaa0001a5']
    gravity_id: '502a6debe8b6470002000004'
    featured: false
    indexable: true
    contributing_authors: []
    email_metadata:
      image_url: 'http://img.png'
      headline: 'Foo'
      author: 'Craig Spaeth'
    super_article:
      partner_link: 'http://partnerlink.com'
      partner_logo: 'http://partnerlink.com/logo.jpg'
      partner_link_title: 'Download The App'
      partner_logo_link: 'http://itunes'
      partner_fullscreen_header_logo: 'http://partnerlink.com/blacklogo.jpg'
      secondary_partner_logo: 'http://secondarypartner.com/logo.png'
      secondary_logo_text: 'In Partnership With'
      secondary_logo_link: 'http://secondary'
      footer_blurb: 'This is a Footer Blurb'
      related_articles: [ '5530e72f7261696238050000' ]
      footer_title: 'Footer Title'
    social_description: 'Social Description Here.'
    social_title: 'Social Title'
    social_image: 'http://socialimage.jpg'
    search_title: 'Search Title'
    search_description: 'Search Description Here.'

  fixtures.users =
    id: '4d8cd73191a5c50ce200002a'
    name: 'Craig Spaeth'
    type: 'Admin'
    profile_icon_url: 'https://d32dm0rphc51dk.cloudfront.net/CJOHhrln8lwVAubiMIIYYA/square140.png'
    access_token: '$2a$10$PJrPMBadu1NPdmnshBgFbeZrE3WtYoIoLoeII0mZDqOnatcOdamke'
    current_channel:
      name: 'Editorial'
      type: 'editorial'
      id: '4d8cd73191a5c50ce200002b'
    channel_ids: ['4d8cd73191a5c50ce200002b']
    partner_ids: []

  fixtures.sections =
    id: '55356a9deca560a0137aa4b7'
    title: 'Vennice Biennalez'
    description: 'The coolest biennale'
    slug: 'vennice-biennale'
    partner_logo_url: 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
    thumbnail_url: 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
    featured_article_ids: [ '5522d03ae8e369060053d953' ]

  fixtures.curations =
    id: '55356a9deca560a0137aa4b7'
    name: 'Featured Articles'

  fixtures.channels =
    id: '5086df098523e60002000018'
    name: 'Editorial'
    user_ids: [ '5522d03ae8e369060053d953', "4d8cd73191a5c50ce200002a" ]
    type: 'editorial'
    tagline: 'A bunch of cool stuff at Artsy'
    image_url: 'artsy.net/image.jpg'
    slug: 'editorial'
    pinned_articles: [
      {
        id: '5086df098523e60002000015'
        index: 0
      },
      {
        id: '5086df098523e60002000011'
        index: 1
      }
    ]
  fixtures.tags =
    id: '55356a9deca560a0137aa4b7'
    name: 'Show Reviews'
    public: true

  fixtures.verticals =
    id: '55356a9deca560a0137bb4a7'
    name: 'Culture'

  fixtures.authors =
    id: '55356a9deca560a0137bb4a7'
    name: 'Halley Johnson'
    bio: 'Writer based in NYC'
    twitter_handle: 'kanaabe'
    image_url: 'https://artsy-media.net/halley.jpg'

  fixtures.display =
    canvas:
      layout: 'slideshow'
      headline: 'Sample copy sed posuere consectetur est at lobortis. Nullam id dolor ultricies vehicula.'
      body: ''
      link:
        text: 'Link Example'
        url: 'http://artsy.net'
      assets: [
        {
          url: 'https://artsy-media-uploads.s3.amazonaws.com/YqTtwB7AWqKD95NGItwjJg%2FRachel_Rossin_portrait_2.jpg'
          caption: 'Nullam id dolor ultricies vehicula.'
        },
        { url: 'https://d32dm0rphc51dk.cloudfront.net/0aRUvnVgQKbQk5dj8xcCAg/larger.jpg'}
      ]
      logo: 'http://files.artsy.net/images/artsy-logo-wide-black.png'
      disclaimer: 'Donec id elit non mi porta gravida at eget metus. Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
    name: 'Sample Campaign'
    panel:
      headline: 'Euismod Inceptos Quam'
      body: '<p>Donec sed odio dui. Cras justo odio, dapibus ac facilisis in, egestas eget quam. <a href="http://artsy.net/articles">Example Link</a></p>'
      assets: [
        { url: 'https://artsy-media-uploads.s3.amazonaws.com/YqTtwB7AWqKD95NGItwjJg%2FRachel_Rossin_portrait_2.jpg' }
      ]
      logo: 'https://artsy-vanity-files-production.s3.amazonaws.com/images/artsy_logo_square_white_transparent.png',
      link: { text: '', url: 'http://artsy.net' }
    sov: .25
    start_date: moment(new Date()).subtract(1, 'days').toDate()
    end_date: moment(new Date()).add(1, 'days').toDate()

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
