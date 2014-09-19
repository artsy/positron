Articles = require '../../collections/articles.coffee'
spooky = require '../../lib/spooky_fetcher'

@index = (req, res, next) ->
  spooky.new Articles, 'articles', (err, articles) ->
    return next err if err
    res.render 'index', articles: articles.models