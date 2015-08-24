_ = require 'underscore'
BrandPartners = require '../../collections/brand_partners'
BrandPartner = require '../../models/brand_partner'

@index = (req, res) ->
  new BrandPartners().fetch
    data: limit: 100
    error: res.backboneError
    success: (brandPartners) ->
      res.render 'index', brandPartners: brandPartners

@edit = (req, res) ->
  new BrandPartner(id: req.params.id).fetch
    error: res.backboneError
    success: (brandPartner) ->
      res.locals.sd.BRAND_PARTNER = brandPartner.toJSON()
      res.render 'edit', brandPartner: brandPartner

@save = (req, res) ->
  data = _.pick req.body, _.identity
  data.featured_links = cleanFeaturedLinks(data.featured_links)
  console.log req.params.id
  new BrandPartner(id: req.params.id).save data,
    headers: 'X-Access-Token': req.user?.get('access_token')
    error: res.backboneError
    success: ->
      res.redirect '/brand-partners'

cleanFeaturedLinks = (links) ->
  featured = []
  for link in links
    if _.values(link).join('').length
      featured.push link
  featured