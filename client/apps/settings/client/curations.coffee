Backbone = require('backbone')
{ AdminEditView } = require '../../../components/admin_form/index.coffee'
Curation = require '../../../models/curation.coffee'
sd = require('sharify').data
_ = require('underscore')
React = require 'react'
ReactDOM = require 'react-dom'
VeniceAdmin = React.createFactory require './curations/venice_admin.coffee'

module.exports.CurationEditView = class CurationEditView extends Backbone.View

  events:
    'click .settings-edit-feature__section-title': 'revealSection'

  initialize: ->
    @curation = new Curation sd.CURATION
    if @curation.get('name') is 'Inside the Biennale'
      ReactDOM.render(
        VeniceAdmin(curation: @curation)
        $('#venice-root')[0]
      )
    else
      new AdminEditView
        model: @curation
        el: $('body')
        onDeleteUrl: '/settings/curations'
    @initMenuState() if @curation.get('type') is 'editorial-feature'

  initMenuState: =>
    $('.page-header').addClass 'sticky'
    $('.settings-edit-feature').fadeIn()

  revealSection: (e) ->
    $(e.target).next().toggleClass('active').slideToggle()

module.exports.init = ->
  new CurationEditView
    el: $('body')