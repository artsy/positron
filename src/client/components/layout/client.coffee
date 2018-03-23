#
# Project-wide client-side setup code. Sets up Backbone, jQuery helpers,
# view helpers, etc. Don't get too crazy with this "global" code. It's
# encouraged to modularize by app/component before adding to this.
#

_ = require 'underscore'
Backbone = require 'backbone'
viewHelpers = require '../../lib/view_helpers.coffee'
sd = require('sharify').data
User = require '../../models/user.coffee'
AutocompleteChannels = require '../autocomplete_channels/index.coffee'
imagesLoaded = require 'imagesloaded'
RavenClient = require 'raven-js'

# Add jquery plugins
require 'jquery-autosize'
require 'typeahead.js'
require('jquery-fillwidth-lite') $, _, imagesLoaded

module.exports.init = ->
  Backbone.$ = $
  $.ajaxSettings.headers = 'X-Access-Token': sd.USER.access_token
  window[key] = helper for key, helper of viewHelpers
  Backbone.history.start pushState: true
  @user = new User sd.USER

  # Configure Raven
  RavenClient.config(sd.SENTRY_PUBLIC_DSN).install()

  # Switch Channel UI
  $('#layout-sidebar-switch-channel').click =>
    new AutocompleteChannels()

  # Toggle hamburger menu
  $('#layout-hamburger-container').click ->
    $('#layout-sidebar-container').toggleClass('is-active')

  # Ensure a fresh user
  @user.isOutdated (outdated) =>
    if outdated
      @user.refresh =>
        window.location.replace "/logout"
