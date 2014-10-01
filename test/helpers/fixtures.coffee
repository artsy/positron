CurrentUser = require '../../models/current_user'
{ fabricate2 } = require 'antigravity'

@article =
  id: 2
  cache_key: "articles/2-20140718213304818947000"
  title: "The art in Copenhagen is soo over"
  sections_count: 0
  created_at: "2014-07-18 17:33:04 -0400"
  updated_at: "2014-07-18 17:33:04 -0400"
  _links:
    self:
      href: "http://localhost:5000/__spooky/api/articles/2"

    sections_url:
      href: "http://localhost:5000/__spooky/api/articles/2/sections"

    articles_url:
      href: "http://localhost:5000/__spooky/api/articles"

    root_url:
      href: "http://localhost:5000/__spooky/"

@currentUser =
  foo =
  id: "4d8cd73191a5c50ce200002a"
  name: "Craig Spaeth"
  profile:
    id: "5086df098523e60002000012"
    created_at: "2012-10-23T18:16:41+00:00"
    updated_at: "2014-09-24T20:38:41+00:00"
    handle: "craig"
    location: "New York, New York"
    description: "Developer at Artsy. My heart swoons for code, art, & indie games."
    _links:
      curies: [
        name: "image"
        href: "http://static3.artsy.net/profile_icons/504e2c4fbb39040002000483/{?rel}"
        templated: true
      ]
      thumbnail:
        href: "/assets/shared/missing_image.png"
      "image:self":
        href: "{?image_version}.jpg"
      self:
        href: "http://localhost:5000/__gravity/api/profiles/5086df098523e60002000012"
      permalink:
        href: "http://artsy.net/craig"
      website:
        href: ""
    image_versions: ["square140"]

  accessToken: "foo-token"

@locals =
  user: new CurrentUser @currentUser
  sd:
    PATH: '/'
  moment: require 'moment'
  sharify:
    script: -> '<script>var sharify = {}</script>'