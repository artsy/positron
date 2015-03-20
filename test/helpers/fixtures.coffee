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
  fixtures.artists = {"id":"4d8b92b34eb68a1b2c0003f4","artist":{"id":"4d8b92b34eb68a1b2c0003f4","created_at":"2010-08-23T14:15:30+00:00","updated_at":"2014-11-12T19:30:44+00:00","name":"Andy Warhol","gender":"male","birthday":"1928","hometown":"Pittsburgh, Pennsylvania","location":"New York ","nationality":"American","statement":"","biography":"An American painter, printmaker, sculptor, draughtsman, illustrator, filmmaker, writer and collector, who became one of the most famous artists of the 20th century. Warhol began his career as a successful commercial artist and illustrator for magazines and newspapers but by 1960 was determined to establish his name as a painter. He quickly became renowned for painting everyday advertisements or images from comic strips that looked eerily similar to the originals and contained no traditional marks of an artist. Warhol accentuated this look through the use of silkscreens and by painting in collaboration with a team of assistants in a studio he called \"The Factory.\" In the late sixties, Warhol turned his attention to making experimental films and multimedia events, and in the 1970s, to creating commissioned portraits. During the 1980s Warhol continued to exert an influence on the art world, collaborating with young artists such as Jean-Michel Basquiat and creating a series of paintings, which engaged with Renaissance masterworks.","blurb":"Obsessed with celebrity, consumer culture, and mechanical (re)production, [Pop artist](/gene/pop-art) Andy Warhol created some of the most iconic images of the 20th century. As famous for his quips as for his art—he variously mused that “art is what you can get away with” and “everyone will be famous for 15 minutes”—Warhol drew widely from popular culture and everyday subject matter, creating works like his _32 Campbell's Soup Cans_ (1962), [Brillo pad box sculptures](/artwork/andy-warhol-set-of-four-boxes-campbells-tomato-juice-del-monte-peach-halves-brillo-soap-pads-heinz-tomato-ketchup), and portraits of Marilyn Monroe, using the medium of silk-screen printmaking to achieve his characteristic hard edges and flat areas of color. Known for his cultivation of celebrity, Factory studio (a radical social and creative melting pot), and avant-garde films like _Chelsea Girls_ (1966), Warhol was also a mentor to artists like [Keith Haring](/artist/keith-haring) and [Jean-Michel Basquiat](/artist/jean-michel-basquiat). His Pop sensibility is now standard practice, taken up by major contemporary artists [Richard Prince](/artist/richard-prince), [Takashi Murakami](/artist/takashi-murakami), and [Jeff Koons](/artist/jeff-koons), among countless others.","education":"","awards":"","publications":"","collections":"","soloexhibitions":"","groupexhibitions":"","_links":{"curies":[{"name":"image","href":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/{rel}","templated":true}],"thumbnail":{"href":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/four_thirds.jpg"},"image:self":{"href":"{?image_version}.jpg","templated":true},"self":{"href":"https://api.artsy.net/api/artists/4d8b92b34eb68a1b2c0003f4"},"permalink":{"href":"http://artsy.net/artist/andy-warhol"},"artworks":{"href":"https://api.artsy.net/api/artworks?artist_id=4d8b92b34eb68a1b2c0003f4"},"similar_artists":{"href":"https://api.artsy.net/api/artists?similar_to_artist_id=4d8b92b34eb68a1b2c0003f4"},"similar_contemporary_artists":{"href":"https://api.artsy.net/api/artists?similar_to_artist_id=4d8b92b34eb68a1b2c0003f4&similarity_type=contemporary"},"genes":{"href":"https://api.artsy.net/api/genes?artist_id=4d8b92b34eb68a1b2c0003f4"}},"image_versions":["square","tall","large","four_thirds"]},"image_urls":{"square":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/square.jpg","tall":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/tall.jpg","large":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/large.jpg","four_thirds":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/four_thirds.jpg"}}
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
