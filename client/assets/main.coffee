#
# Run layout code & determine which app code to run. As assets get too large we
# can break this up into self-initializing app-level asset packages like Force.
#

Backbone = require 'backbone'
window.jQuery = window.$ = $ = require 'jquery'

class Router extends Backbone.Router

  routes:
    'articles/new': 'articleEdit'
    'articles/:id/edit': 'articleEdit'
    'verticals/new': 'verticalEdit'
    'verticals/:id/edit': 'verticalEdit'
    'brand-partners/new' : 'brandPartnerEdit'
    'brand-partners/:id/edit': 'brandPartnerEdit'

  articleEdit: ->
    require('../apps/edit/client.coffee').init()

  verticalEdit: ->
    require('../apps/verticals/edit_client.coffee').init()

  brandPartnerEdit: ->
    require('../apps/brand_partners/edit_client.coffee').init()

new Router()
$ ->
  require('../components/layout/client.coffee').init()