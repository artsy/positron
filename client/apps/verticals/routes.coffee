_ = require 'underscore'
Verticals = require '../../collections/verticals'
Vertical = require '../../models/vertical'

@index = (req, res) ->
  new Verticals().fetch
    data: limit: 100
    error: res.backboneError
    success: (verticals) ->
      res.render 'index', verticals: verticals

@edit = (req, res) ->
  new Vertical(id: req.params.id).fetch
    error: res.backboneError
    success: (vertical) ->
      res.locals.sd.VERTICAL = vertical.toJSON()
      res.render 'edit', vertical: vertical

@save = (req, res) ->
  data = _.pick req.body, _.identity
  data.featured_links = cleanFeaturedLinks(data.featured_links)
  data.featured = data.featured?
  new Vertical(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/verticals'

cleanFeaturedLinks = (links) ->
  featured = []
  for link in links
    if _.values(link).join('').length
      featured.push link
  featured