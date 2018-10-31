#
# Run layout code & determine which app code to run. As assets get too large we
# can break this up into self-initializing app-level asset packages like Force.
#

require('regenerator-runtime/runtime')
Backbone = require 'backbone'
window.jQuery = window.$ = $ = require 'jquery'
window.global = window

React = require 'react'
DOM = require 'react-dom-factories'
createClass = require('create-react-class')

# Patch React 16 with deprecated helpers
React.DOM = DOM
React.createClass = createClass

class Router extends Backbone.Router

  routes:
    'articles/new': 'articleEdit'
    'articles/:id/edit': 'articleEdit'
    # TODO: Remove after text2
    'articles/:id/edit2': 'articleEdit'
    'settings/curations/:id/edit': 'curationsEdit'
    'settings/channels/:id/edit': 'channelsEdit'
    'queue': 'queueEdit'
    'articles': 'articlesListView'
    'settings/tags': 'tagsEdit'
    'settings/authors': 'authorsEdit'

  articleEdit: ->
    require('../apps/edit/client').init()

  curationsEdit: ->
    require('../apps/settings/client/curations.coffee').init()

  channelsEdit: ->
    require('../apps/settings/client/channels.coffee').init()

  queueEdit: ->
    require('../apps/queue/client').init()

  articlesListView: ->
    require('../apps/articles_list/client').init()

  tagsEdit: ->
    require('../apps/settings/client/tags.coffee').init()

  authorsEdit: ->
    require('../apps/settings/client/authors/index.coffee').init()

new Router()
$ ->
  require('../components/layout/client.coffee').init()
