_ = require 'underscore'
LinkSets = require '../../collections/link_sets'
LinkSet = require '../../models/link_set'

@index = (req, res) ->
  new LinkSets().fetch
    data: limit: 100
    error: res.backboneError
    success: (linkSets) ->
      res.render 'index', linkSets: linkSets

@edit = (req, res) ->
  new LinkSet(id: req.params.id).fetch
    error: res.backboneError
    success: (linkSet) ->
      res.locals.sd.LINK_SET = linkSet.toJSON()
      res.render 'edit', linkSet: linkSet

@save = (req, res) ->
  data = _.pick req.body, _.identity
  data.featured_links = cleanFeaturedLinks(data.featured_links) if data.featured_links
  new LinkSet(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/links'

cleanFeaturedLinks = (links) ->
  featured = []
  for link in links
    if _.values(link).join('').length
      featured.push link
  featured
