#
# Project-wide client-side setup code. Sets up Backbone, jQuery helpers,
# view helpers, etc. Don't get too crazy with this "global" code. It's
# encouraged to modularize by app/component before adding to this.
#

Backbone = require 'backbone'
viewHelpers = require '../../lib/view_helpers.coffee'

module.exports.init = ->
  Backbone.$ = $
  window[key] = helper for key, helper of viewHelpers
  Backbone.history.start pushState: true