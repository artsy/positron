_ = require 'underscore'
{ present, presentCollection } = Article = require './model'
{ setUser } = require '../users/routes'

# GET /api/articles
@index = (req, res, next) ->
  if req.query.published isnt 'true' and (not req.query.author_id? or
     req.query.author_id isnt req.user?._id.toString()) and
     req.user?.type isnt 'Admin'
    return res.err 401,
      'Must pass author_id=me to view unpublished articles. Or pass ' +
      'published=true to only view published articles.'
  Article.where req.query, (err, results) ->
    return next err if err
    res.send presentCollection results

# GET /api/articles/:id
@show = (req, res, next) ->
  if req.article.published or req.user?.type is 'Admin' or
     req.article.author_id.equals req.user?._id
    res.send present req.article
  else
    res.err 404, 'Article not found.'

# POST /api/articles
@create = (req, res, next) ->
  data =_.extend { author_id: req.user._id }, req.body
  Article.save data, req.accessToken, (err, article) ->
    return next err if err
    res.send present article

# PUT /api/articles/:id
@update = (req, res, next) ->
  data = _.extend(req.article, req.body)
  Article.save data, req.accessToken, (err, article) ->
    return next err if err
    res.send present article

# DELETE /api/articles/:id
@delete = (req, res, next) ->
  Article.destroy req.article._id, (err) ->
    return next err if err
    res.send present req.article

# Fetch & attach a req.article middleware
@find = (req, res, next) ->
  Article.find (req.params.id or req.query.article_id), (err, article) ->
    return next err if err
    return res.err 404, 'Article not found.' unless req.article = article
    if req.article?.published then next() else setUser(req, res, next)
