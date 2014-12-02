#
# Project-wide client-side setup code. Sets up Backbone, jQuery helpers,
# view helpers, etc. Don't get too crazy with this "global" code. It's
# encouraged to modularize by app/component before adding to this.
#

_ = require 'underscore'
Backbone = require 'backbone'
viewHelpers = require '../../lib/view_helpers.coffee'
Autocomplete = require '../autocomplete/index.coffee'
sd = require('sharify').data
Modal = require 'simple-modal'

# Add jquery plugins
require 'jquery-autosize'

module.exports.init = ->
  Backbone.$ = $
  $.ajaxSettings.headers = 'X-Access-Token': sd.USER.access_token
  window[key] = helper for key, helper of viewHelpers
  Backbone.history.start pushState: true

$('#layout-sidebar-profile-menu').click ->
  modal = Modal
    title: 'Switch User'
    content: "<input placeholder='Search by user name...'>"
    removeOnClose: true
    buttons: [
      { text: 'Cancel', closeOnClick: true }
      { className: 'simple-modal-close', closeOnClick: true }
    ]
  new Autocomplete
    el: $(modal.m).find('input')
    url: "#{sd.API_URL}/users?q=%QUERY"
    filter: (res) -> for r in res.results
      { id: r.id, value: r.user.name + ', ' + (r.details?.email or '') }
    selected: (e, item) =>
      location.assign '/impersonate/' + item.id
  _.defer -> $(modal.m).find('input').focus()
