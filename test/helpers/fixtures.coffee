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
    tags: ['Fair Coverage', 'Magazine']
    title: 'Top Ten Booths',
    lead_paragraph: 'Just before the lines start forming...',
    published: true,
    published_at: moment().add(timeCount, 'seconds').format(),
    updated_at: moment().add(timeCount, 'seconds').format(),
    sections: [
      {
        type: 'image',
        url: 'http://gemini.herokuapp.com/123/miaart-banner.jpg'
      },
      {
        type: 'text',
        body: '<p><h1>10. Lisson Gallery</h1></p><p>Mia Bergeron merges the <em>personal</em> and <em>universal</em>...',
      },
      {
        type: 'artworks',
        ids: ['5321b73dc9dc2458c4000196', '5321b71c275b24bcaa0001a5'],
        layout: 'three_across'
      },
      {
        type: 'text',
        body: 'Check out this video art:',
      },
      {
        type: 'video',
        url: 'http://youtu.be/yYjLrJRuMnY'
      }
    ]
    featured_artist_ids: ['5086df098523e60002000012']
    featured_artwork_ids: ['5321b71c275b24bcaa0001a5']
  fixtures.users =
    "name": "Craig Spaeth",
    "access_token": "test-access-token",
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
      "icon_url": "https://d32dm0rphc51dk.cloudfront.net/CJOHhrln8lwVAubiMIIYYA/square140.png"
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
  fixtures.artworks = {"artwork":{"id":"4d8b93ba4eb68a1b2c001c5b","created_at":"2010-12-20T19:48:55+00:00","updated_at":"2014-08-12T18:10:21+00:00","title":"Skull","category":"Paintings","medium":"Synthetic polymer paint and silkscreen ink on canvas","date":"1976","dimensions":{"in":{"text":"132 × 150 in","height":132,"width":150,"depth":0,"diameter":null},"cm":{"text":"335.3 × 381 cm","height":335.3,"width":381,"depth":0,"diameter":null}},"website":"","signature":"","series":null,"provenance":"","literature":"","exhibition_history":"","collecting_institution":"","additional_information":"","image_rights":"© 2012 The Andy Warhol Foundation for the Visual Arts, Inc. / Artists Rights Society (ARS), New York","blurb":"","unique":false,"cultural_maker":null,"can_inquire":true,"can_acquire":false,"can_share":true,"sale_message":null,"sold":false,"_links":{"curies":[{"name":"image","href":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/{rel}","templated":true}],"thumbnail":{"href":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/medium.jpg"},"image:self":{"href":"{?image_version}.jpg","templated":true},"partner":{"href":"https://stagingapi.artsy.net/api/partners/4d8b92c44eb68a1b2c0004cb"},"self":{"href":"https://stagingapi.artsy.net/api/artworks/4d8b93ba4eb68a1b2c001c5b"},"permalink":{"href":"https://staging.artsy.net/artwork/andy-warhol-skull"},"genes":{"href":"https://stagingapi.artsy.net/api/genes?artwork_id=4d8b93ba4eb68a1b2c001c5b"},"artists":{"href":"https://stagingapi.artsy.net/api/artists?artwork_id=4d8b93ba4eb68a1b2c001c5b"}},"image_versions":["small","square","medium","large","larger","normalized","tall","medium_rectangle","large_rectangle"],"_embedded":{"editions":[]}},"artists":[{"id":"4d8b92b34eb68a1b2c0003f4","created_at":"2010-08-23T14:15:30+00:00","updated_at":"2014-10-19T08:59:38+00:00","name":"Andy Warhol","gender":"male","birthday":"1928","hometown":"Pittsburgh, Pennsylvania","location":"New York ","nationality":"American","statement":"","biography":"An American painter, printmaker, sculptor, draughtsman, illustrator, filmmaker, writer and collector, who became one of the most famous artists of the 20th century. Warhol began his career as a successful commercial artist and illustrator for magazines and newspapers but by 1960 was determined to establish his name as a painter. He quickly became renowned for painting everyday advertisements or images from comic strips that looked eerily similar to the originals and contained no traditional marks of an artist. Warhol accentuated this look through the use of silkscreens and by painting in collaboration with a team of assistants in a studio he called \"The Factory.\" In the late sixties, Warhol turned his attention to making experimental films and multimedia events, and in the 1970s, to creating commissioned portraits. During the 1980s Warhol continued to exert an influence on the art world, collaborating with young artists such as Jean-Michel Basquiat and creating a series of paintings, which engaged with Renaissance masterworks.","blurb":"Obsessed with celebrity, consumer culture, and mechanical (re)production, [Pop artist](/gene/pop-art) Andy Warhol created some of the most iconic images of the 20th century. As famous for his quips as for his art—he variously mused that “art is what you can get away with” and “everyone will be famous for 15 minutes”—Warhol drew widely from popular culture and everyday subject matter, creating works like his _32 Campbell's Soup Cans_ (1962), [Brillo pad box sculptures](/artwork/andy-warhol-set-of-four-boxes-campbells-tomato-juice-del-monte-peach-halves-brillo-soap-pads-heinz-tomato-ketchup), and portraits of Marilyn Monroe, using the medium of silk-screen printmaking to achieve his characteristic hard edges and flat areas of color. Known for his cultivation of celebrity, Factory studio (a radical social and creative melting pot), and avant-garde films like _Chelsea Girls_ (1966), Warhol was also a mentor to artists like [Keith Haring](/artist/keith-haring) and [Jean-Michel Basquiat](/artist/jean-michel-basquiat). His Pop sensibility is now standard practice, taken up by major contemporary artists [Richard Prince](/artist/richard-prince), [Takashi Murakami](/artist/takashi-murakami), and [Jeff Koons](/artist/jeff-koons), among countless others.","education":"","awards":"","publications":"","collections":"","soloexhibitions":"","groupexhibitions":"","_links":{"curies":[{"name":"image","href":"http://stagic1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/{rel}","templated":true}],"thumbnail":{"href":"http://stagic1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/four_thirds.jpg"},"image:self":{"href":"{?image_version}.jpg","templated":true},"self":{"href":"https://stagingapi.artsy.net/api/artists/4d8b92b34eb68a1b2c0003f4"},"permalink":{"href":"https://staging.artsy.net/artist/andy-warhol"},"artworks":{"href":"https://stagingapi.artsy.net/api/artworks?artist_id=4d8b92b34eb68a1b2c0003f4"},"genes":{"href":"https://stagingapi.artsy.net/api/genes?artist_id=4d8b92b34eb68a1b2c0003f4"}},"image_versions":["square","tall","large","four_thirds"]}],"partner":{"id":"4d8b92c44eb68a1b2c0004cb","created_at":"2011-03-24T18:51:48+00:00","updated_at":"2014-10-19T06:58:38+00:00","type":"Gallery","name":"Gagosian Gallery","email":"newyork@gagosian.com","region":"North America","_links":{"self":{"href":"https://stagingapi.artsy.net/api/partners/4d8b92c44eb68a1b2c0004cb"},"profile":{"href":"https://stagingapi.artsy.net/api/profiles/gagosian-gallery"},"artworks":{"href":"https://stagingapi.artsy.net/api/artworks?partner_id=4d8b92c44eb68a1b2c0004cb"},"shows":{"href":"https://stagingapi.artsy.net/api/shows?partner_id=4d8b92c44eb68a1b2c0004cb"},"permalink":{"href":"https://staging.artsy.net/gagosian-gallery"},"website":{"href":"http://www.gagosian.com"}}},"image_urls":{"small":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/small.jpg","square":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/square.jpg","medium":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/medium.jpg","large":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/large.jpg","larger":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/larger.jpg","normalized":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/normalized.jpg","tall":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/tall.jpg","medium_rectangle":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/medium_rectangle.jpg","large_rectangle":"http://stagic0.artsy.net/additional_images/4e68f259528702000104c329/1/large_rectangle.jpg"}}
  fixtures.artists = {"id":"4d8b92b34eb68a1b2c0003f4","artist":{"id":"4d8b92b34eb68a1b2c0003f4","created_at":"2010-08-23T14:15:30+00:00","updated_at":"2014-11-12T19:30:44+00:00","name":"Andy Warhol","gender":"male","birthday":"1928","hometown":"Pittsburgh, Pennsylvania","location":"New York ","nationality":"American","statement":"","biography":"An American painter, printmaker, sculptor, draughtsman, illustrator, filmmaker, writer and collector, who became one of the most famous artists of the 20th century. Warhol began his career as a successful commercial artist and illustrator for magazines and newspapers but by 1960 was determined to establish his name as a painter. He quickly became renowned for painting everyday advertisements or images from comic strips that looked eerily similar to the originals and contained no traditional marks of an artist. Warhol accentuated this look through the use of silkscreens and by painting in collaboration with a team of assistants in a studio he called \"The Factory.\" In the late sixties, Warhol turned his attention to making experimental films and multimedia events, and in the 1970s, to creating commissioned portraits. During the 1980s Warhol continued to exert an influence on the art world, collaborating with young artists such as Jean-Michel Basquiat and creating a series of paintings, which engaged with Renaissance masterworks.","blurb":"Obsessed with celebrity, consumer culture, and mechanical (re)production, [Pop artist](/gene/pop-art) Andy Warhol created some of the most iconic images of the 20th century. As famous for his quips as for his art—he variously mused that “art is what you can get away with” and “everyone will be famous for 15 minutes”—Warhol drew widely from popular culture and everyday subject matter, creating works like his _32 Campbell's Soup Cans_ (1962), [Brillo pad box sculptures](/artwork/andy-warhol-set-of-four-boxes-campbells-tomato-juice-del-monte-peach-halves-brillo-soap-pads-heinz-tomato-ketchup), and portraits of Marilyn Monroe, using the medium of silk-screen printmaking to achieve his characteristic hard edges and flat areas of color. Known for his cultivation of celebrity, Factory studio (a radical social and creative melting pot), and avant-garde films like _Chelsea Girls_ (1966), Warhol was also a mentor to artists like [Keith Haring](/artist/keith-haring) and [Jean-Michel Basquiat](/artist/jean-michel-basquiat). His Pop sensibility is now standard practice, taken up by major contemporary artists [Richard Prince](/artist/richard-prince), [Takashi Murakami](/artist/takashi-murakami), and [Jeff Koons](/artist/jeff-koons), among countless others.","education":"","awards":"","publications":"","collections":"","soloexhibitions":"","groupexhibitions":"","_links":{"curies":[{"name":"image","href":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/{rel}","templated":true}],"thumbnail":{"href":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/four_thirds.jpg"},"image:self":{"href":"{?image_version}.jpg","templated":true},"self":{"href":"https://api.artsy.net/api/artists/4d8b92b34eb68a1b2c0003f4"},"permalink":{"href":"http://artsy.net/artist/andy-warhol"},"artworks":{"href":"https://api.artsy.net/api/artworks?artist_id=4d8b92b34eb68a1b2c0003f4"},"similar_artists":{"href":"https://api.artsy.net/api/artists?similar_to_artist_id=4d8b92b34eb68a1b2c0003f4"},"similar_contemporary_artists":{"href":"https://api.artsy.net/api/artists?similar_to_artist_id=4d8b92b34eb68a1b2c0003f4&similarity_type=contemporary"},"genes":{"href":"https://api.artsy.net/api/genes?artist_id=4d8b92b34eb68a1b2c0003f4"}},"image_versions":["square","tall","large","four_thirds"]},"image_urls":{"square":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/square.jpg","tall":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/tall.jpg","large":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/large.jpg","four_thirds":"http://static1.artsy.net/artist_images/52f6bdda4a04f5d504f69b03/1/four_thirds.jpg"}}
  fixtures.locals =
    user: new CurrentUser fixtures.users
    sd:
      PATH: '/'
    moment: require 'moment'
    sharify:
      script: -> '<script>var sharify = {}</script>'
  fixtures
