_ = require 'underscore'
{ present, presentCollection } = Article = require './model'

# GET /api/articles
@index = (req, res, next) ->
  unless req.query.author_id is req.user?._id.toString()
    return res.err 401, 'Must pass your author_id.'
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
    unless article? and article.author_id.toString() is req.user._id.toString()
      return res.err 404, 'Article not found.'
    req.article = article
    next()
