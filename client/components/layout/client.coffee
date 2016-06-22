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
imagesLoaded = require 'imagesloaded'
User = require '../../models/user.coffee'

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
  ensureFreshUser()

# Replace broken profile icon
imgLoad = imagesLoaded('#layout-sidebar-profile img')
imgLoad.on 'fail', ->
  $('#layout-sidebar-profile img').attr(
    'src'
    "/images/layout_missing_user.png"
  )

# Open switch channel modal
$('#layout-sidebar-switch-channel').click ->
  modal = Modal
    title: 'Switch Channel'
    content: "<input placeholder='Search by channel name...'>"
    removeOnClose: true
    buttons: [
      { text: 'Cancel', closeOnClick: true }
      { className: 'simple-modal-close', closeOnClick: true }
    ]
  new Autocomplete
    el: $(modal.m).find('input')
    url: "#{sd.API_URL}/channels?user_id=#{sd.USER.id}&q=%QUERY"
    filter: (channels) -> for channel in channels.results
      console.log channel
      { id: channel.id, value: channel.name }
    selected: (e, item) =>
      location.assign '/switch_channel/' + item.id
  _.defer -> $(modal.m).find('input').focus()

# Toggle hamburger menu
$('#layout-hamburger-container').click ->
  $('#layout-sidebar-container').toggleClass('is-active')

ensureFreshUser = ->
  user = new User sd.USER
  user.isOutdated (outdated) ->
    console.log 'outdated?'
    user.resave() if outdated

initAnalyitcs = ->
  if sd.USER
    analytics.identify sd.USER.id,
      email: sd.USER.email
      name: sd.USER.name
  analytics.page()
