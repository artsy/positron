_ = require 'underscore'
{ present, presentCollection } = Article = require './model'
{ setUser } = require '../users/routes'
User = require '../users/model.coffee'

# GET /api/articles
@index = (req, res, next) ->
  if (req.query.published is 'false' or req.query.scheduled is 'true') and not req.query.channel_id
    return res.err(401, 'Must pass channel_id to view unpublished articles. Or pass ' +
      'published=true to only view published articles.')

  access = User.hasChannelAccess req.user, req.query.channel_id
  if (req.query.published is 'false' or req.query.scheduled is 'true') and not access
    return res.err(401,
      'Must be a member of this channel to view unpublished articles. ' +
      'Pass published=true to only view published articles.')

  Article.where req.query, (err, results) ->
    return next err if err
    res.send presentCollection results

# GET /api/articles/:id
@show = (req, res, next) ->
  return res.send present req.article if req.article.published

  if User.hasChannelAccess req.user, (req.article.channel_id or req.article.partner_channel_id)
    res.send present req.article
  else
    res.err 404, 'Article not found.'

# POST /api/articles
@create = (req, res, next) ->
  unless User.hasChannelAccess req.user, (req.body.channel_id or req.body.partner_channel_id)
    return res.err(401, 'Unauthorized')

  data =_.extend { author_id: req.user._id }, req.body
  Article.save data, req.user?.access_token, (err, article) ->
    return next err if err
    res.send present article

# PUT /api/articles/:id
@update = (req, res, next) ->
  unless User.hasChannelAccess req.user, (req.article.channel_id or req.article.partner_channel_id)
    return res.err(401, 'Unauthorized')

  data = _.extend(req.article, req.body)
  Article.save data, req.user?.access_token, (err, article) ->
    return next err if err
    res.send present article

# DELETE /api/articles/:id
@delete = (req, res, next) ->
  unless User.hasChannelAccess req.user, (req.article.channel_id or req.article.partner_channel_id)
    return res.err(401, 'Unauthorized')

  Article.destroy req.article._id, (err) ->
    return next err if err
    res.send present req.article

# Don't let non-admins feature
@restrictFeature = (req, res, next) ->
  if req.user?.type isnt 'Admin' and req.body.featured
    res.err 401, 'You must be an admin to feature an article.'
  else
    next()

# Fetch & attach a req.article middleware
@find = (req, res, next) ->
  Article.find (req.params.id or req.query.article_id), (err, article) ->
    return next err if err
    return res.err 404, 'Article not found.' unless req.article = article
    if req.article?.published then next() else setUser(req, res, next)
