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
    'sections/new': 'sectionEdit'
    'sections/:id/edit': 'sectionEdit'
    'settings/curations/:id/edit': 'curationsEdit'
    'settings/channels/:id/edit': 'channelsEdit'
    'queue': 'queueEdit'

  articleEdit: ->
    require('../apps/edit/client.coffee').init()

  sectionEdit: ->
    require('../apps/sections/edit_client.coffee').init()

  curationsEdit: ->
    require('../apps/settings/client/curations.coffee').init()

  channelsEdit: ->
    require('../apps/settings/client/channels.coffee').init()

  queueEdit: ->
    require('../apps/queue/client/client.coffee').init()

new Router()
$ ->
  require('../components/layout/client.coffee').init()