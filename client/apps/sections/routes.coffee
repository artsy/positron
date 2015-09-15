_ = require 'underscore'
FeatureSections = require '../../collections/feature_sections'
FeatureSection = require '../../models/feature_section'

@index = (req, res) ->
  new FeatureSections().fetch
    data: limit: 100
    error: res.backboneError
    success: (sections) ->
      res.render 'index', sections: sections

@edit = (req, res) ->
  new FeatureSection(id: req.params.id).fetch
    error: res.backboneError
    success: (section) ->
      res.locals.sd.SECTION = section.toJSON()
      res.render 'edit', section: section

@save = (req, res) ->
  data = _.pick req.body, _.identity
  data.featured_links = cleanFeaturedLinks(data.featured_links)
  data.featured = data.featured?
  new FeatureSection(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/sections'

cleanFeaturedLinks = (links) ->
  featured = []
  for link in links
    if _.values(link).join('').length
      featured.push link
  featured