#
# Project-wide client-side setup code. Sets up Backbone, jQuery helpers,
# view helpers, etc. Don't get too crazy with this "global" code. It's
# encouraged to modularize by app/component before adding to this.
#

_ = require 'underscore'
Backbone = require 'backbone'
viewHelpers = require '../../lib/view_helpers.coffee'
sd = require('sharify').data

module.exports.init = ->
  Backbone.$ = $
  # TODO: This header seems to freeze the Rails server
  # $.ajaxSettings.headers = 'Authorization: Token token': sd.SPOOKY_TOKEN
  sync = Backbone.sync
  Backbone.sync = (method, model, options) ->
    model.url = _.result(model, 'url') + '?token=' + sd.SPOOKY_TOKEN
    sync arguments...
  window[key] = helper for key, helper of viewHelpers
  Backbone.history.start pushState: true