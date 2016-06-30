#
# Project-wide client-side setup code. Sets up Backbone, jQuery helpers,
# view helpers, etc. Don't get too crazy with this "global" code. It's
# encouraged to modularize by app/component before adding to this.
#

_ = require 'underscore'
Backbone = require 'backbone'
viewHelpers = require '../../lib/view_helpers.coffee'
sd = require('sharify').data
imagesLoaded = require 'imagesloaded'
User = require '../../models/user.coffee'
channelAutocomplete = require './channel_autocomplete.coffee'

# Add jquery plugins
require 'jquery-autosize'
require 'typeahead.js'
require('jquery-fillwidth-lite') $, _, imagesLoaded

module.exports.init = ->
  Backbone.$ = $
  $.ajaxSettings.headers = 'X-Access-Token': sd.USER.access_token
  window[key] = helper for key, helper of viewHelpers
  Backbone.history.start pushState: true
  initAnalyitcs()
  channelAutocomplete.init()
  ensureFreshUser()

# Replace broken profile icon
imgLoad = imagesLoaded('#layout-sidebar-profile img')
imgLoad.on 'fail', ->
  $('#layout-sidebar-profile img').attr(
    'src'
    "/images/layout_missing_user.png"
  )

# Toggle hamburger menu
$('#layout-hamburger-container').click ->
  $('#layout-sidebar-container').toggleClass('is-active')

ensureFreshUser = ->
  user = new User sd.USER
  user.isOutdated (outdated) ->
    user.refresh() if outdated

initAnalyitcs = ->
  if sd.USER
    analytics.identify sd.USER.id,
      email: sd.USER.email
      name: sd.USER.name
  analytics.page()
