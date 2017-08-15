#
# Run layout code & determine which app code to run. As assets get too large we
# can break this up into self-initializing app-level asset packages like Force.
#

Backbone = require 'backbone'
window.jQuery = window.$ = $ = require 'jquery'
window.global = window

class Router extends Backbone.Router

  routes:
    'articles/new': 'articleEdit'
    'articles/:id/edit': 'articleEdit'
    'articles/:id/edit2': 'articleEdit'
    'settings/curations/:id/edit': 'curationsEdit'
    'settings/channels/:id/edit': 'channelsEdit'
    'queue': 'queueEdit'
    'articles': 'articlesListView'
    'settings/tags': 'tagsEdit'
    'settings/authors': 'authorsEdit'
    'react-example': 'reactExample'

  articleEdit: ->
    require('../apps/edit/client.coffee').init()

  curationsEdit: ->
    require('../apps/settings/client/curations.coffee').init()

  channelsEdit: ->
    require('../apps/settings/client/channels.coffee').init()

  queueEdit: ->
    require('../apps/queue/client/client.coffee').init()

  articlesListView: ->
    require('../apps/articles_list/client/client.coffee').init()

  tagsEdit: ->
    require('../apps/settings/client/tags.coffee').init()

  authorsEdit: ->
    require('../apps/settings/client/authors/index.coffee').init()

  reactExample: ->
    require('../apps/react_example/client').default()


new Router()
$ ->
  require('../components/layout/client.coffee').init()
