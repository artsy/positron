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
    require.ensure(
      ['../apps/edit/client'],
      (require) -> require('../apps/edit/client').init(),
      (err) -> console.warn(err),
      'articleEdit'
    )

  curationsEdit: ->
    require.ensure(
      ['../apps/settings/client/curations.coffee'],
      (require) -> require('../apps/settings/client/curations.coffee').init(),
      (err) -> console.warn(err),
      'curationsEdit'
    )

  channelsEdit: ->
    require.ensure(
      ['../apps/settings/client/channels.coffee'],
      (require) -> require('../apps/settings/client/channels.coffee').init(),
      (err) -> console.warn(err),
      'channelsEdit'
    )

  queueEdit: ->
    require.ensure(
      ['../apps/queue/client'],
      (require) -> require('../apps/queue/client').init(),
      (err) -> console.warn(err),
      'queueEdit'
    )

  articlesListView: ->
    require.ensure(
      ['../apps/articles_list/client.tsx'],
      (require) -> require('../apps/articles_list/client.tsx').init(),
      (err) -> console.warn(err),
      'articlesListView'
    )

  tagsEdit: ->
    require.ensure(
      ['../apps/settings/client/tags.coffee'],
      (require) -> require('../apps/settings/client/tags.coffee').init(),
      (err) -> console.warn(err),
      'tagsEdit'
    )

  authorsEdit: ->
    require.ensure(
      ['../apps/settings/client/authors/index.coffee'],
      (require) -> require('../apps/settings/client/authors/index.coffee').init(),
      (err) -> console.warn(err),
      'authorsEdit'
    )

new Router()
$ ->
  require('../components/layout/client.coffee').init()
