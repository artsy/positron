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
      href: "http://spooky-production.herokuapp.com/api/articles/2"

    sections_url:
      href: "http://spooky-production.herokuapp.com/api/articles/2/sections"

    articles_url:
      href: "http://spooky-production.herokuapp.com/api/articles"

    root_url:
      href: "http://spooky-production.herokuapp.com/"

@locals =
  user: new CurrentUser name: 'Craig', profile: fabricate2 'profile'
  sd:
    PATH: '/'
  moment: require 'moment'
  sharify:
    script: -> '<script>var sharify = {}</script>'