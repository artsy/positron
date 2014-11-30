_ = require 'underscore'
{ present, presentCollection } = Article = require './model'

# GET /api/articles
@index = (req, res, next) ->
  if req.query.published isnt 'true' and (not req.query.author_id? or
     req.query.author_id isnt req.user?._id.toString()) and
     req.user?.details?.type isnt 'Admin'
    return res.err 401,
      'Must pass author_id=me to view unpublished articles. Or pass ' +
      'published=true to only view published articles.'
  Article.where req.query, (err, results) ->
    return next err if err
    res.send presentCollection results

# GET /api/articles/:id
@show = (req, res, next) ->
  res.send present req.article

# POST /api/articles
@create = (req, res, next) ->
  data =_.extend { author_id: req.user._id }, req.body
  Article.save data, (err, article) ->
    return next err if err
    res.send present article

# PATCH/PUT /api/articles/:id
@update = (req, res, next) ->
  Article.save _.extend(req.article, req.body), (err, article) ->
    return next err if err
    res.send present article

# DELETE /api/articles/:id
@delete = (req, res, next) ->
  Article.destroy req.article._id, (err) ->
    return next err if err
    res.send present req.article

# Fetch & attach a req.article middleware
@find = (req, res, next) ->
  Article.find req.params.id, (err, article) ->
    return next err if err
    if not article? or (article.published isnt true and
       article.author_id.toString() isnt req.user?._id.toString()) and
       req.user?.details?.type isnt 'Admin'
      return res.err 404, 'Article not found.'
    req.article = article
    next()
