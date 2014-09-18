@model =
  article:
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

@collection =
  _embedded: [
    {
      article:
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
    }
    {
      article:
        id: 1
        cache_key: "articles/1-20140718213304747666000"
        title: "Art in  is pretty great"
        sections_count: 2
        created_at: "2014-07-18 17:33:04 -0400"
        updated_at: "2014-07-18 17:33:04 -0400"
        _links:
          self:
            href: "http://spooky-production.herokuapp.com/api/articles/1"
          sections_url:
            href: "http://spooky-production.herokuapp.com/api/articles/1/sections"
          articles_url:
            href: "http://spooky-production.herokuapp.com/api/articles"
          root_url:
            href: "http://spooky-production.herokuapp.com/"
    }
  ]
  _links:
    self:
      href: "http://spooky-production.herokuapp.com/api/articles"
    root_url:
      href: "http://spooky-production.herokuapp.com/"
    pagination:
      first:
        href: "http://spooky-production.herokuapp.com/api/articles?page=1"
      previous: null
      self:
        href: "http://spooky-production.herokuapp.com/api/articles?page=1"
      next: null
      last:
        href: "http://spooky-production.herokuapp.com/api/articles?page=1"
  total_count: 2