Article = require '../../models/article'

@create = (req, res, next) ->
  res.render 'index', article: new Article