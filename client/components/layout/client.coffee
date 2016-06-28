#
# Project-wide client-side setup code. Sets up Backbone, jQuery helpers,
# view helpers, etc. Don't get too crazy with this "global" code. It's
# encouraged to modularize by app/component before adding to this.
#

_ = require 'underscore'
Backbone = require 'backbone'
viewHelpers = require '../../lib/view_helpers.coffee'
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

  $el = $(modal.m).find('input')
  channels = new Bloodhound
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
    queryTokenizer: Bloodhound.tokenizers.whitespace
    remote:
      url: "#{sd.API_URL}/channels?user_id=#{sd.USER.id}&q=%QUERY"
      filter: (channels) -> for channel in channels.results
        { id: channel.id, value: channel.name }
      ajax:
        beforeSend: =>
          $el.closest('.twitter-typeahead').addClass 'is-loading'
        complete: =>
          $el.closest('.twitter-typeahead').removeClass 'is-loading'
  partners = new Bloodhound
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
    queryTokenizer: Bloodhound.tokenizers.whitespace
    remote:
      url: "#{sd.ARTSY_URL}/api/v1/match/partners?term=%QUERY"
      filter: (partners) -> for partner in partners
        console.log partner
        { id: partner._id, value: partner.name }
      ajax:
        beforeSend: =>
          $el.closest('.twitter-typeahead').addClass 'is-loading'
        complete: =>
          $el.closest('.twitter-typeahead').removeClass 'is-loading'
  channels.initialize()
  partners.initialize()

  templates = empty: -> """
    <div class='autocomplete-empty'>No results</div>
  """
  $el.typeahead null,
    name: 'channels'
    source: channels.ttAdapter()
    templates: templates
  ,
    name: 'partners'
    source: partners.ttAdapter()
    templates: templates

  $el.on 'typeahead:selected', (e, item) =>
    location.assign '/switch_channel/' + item.id
  _.defer -> $(modal.m).find('input').focus()

# Toggle hamburger menu
$('#layout-hamburger-container').click ->
  $('#layout-sidebar-container').toggleClass('is-active')

ensureFreshUser = ->
  user = new User sd.USER
  user.isOutdated (outdated) ->
    user.resave() if outdated

initAnalyitcs = ->
  if sd.USER
    analytics.identify sd.USER.id,
      email: sd.USER.email
      name: sd.USER.name
  analytics.page()
