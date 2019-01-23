Backbone = require('backbone')
{ AdminEditView } = require '../../../components/admin_form/index.coffee'
Curation = require '../../../models/curation.coffee'
sd = require('sharify').data
_ = require('underscore')
React = require 'react'
ReactDOM = require 'react-dom'
VeniceAdmin = React.createFactory require './curations/venice/venice_admin.coffee'
DisplayAdmin = require './curations/display/index.tsx'
{ GucciAdmin } = require './curations/gucci/index.jsx'

module.exports.CurationEditView = class CurationEditView extends Backbone.View

  events:
    'click .settings-edit-feature__section-title': 'revealSection'

  initialize: ->
    @curation = new Curation sd.CURATION
    if @curation.get('id') is sd.EF_VENICE
      ReactDOM.render(
        VeniceAdmin(curation: @curation)
        $('#react-root')[0]
      )
    else if @curation.get('id') is sd.EF_GUCCI
      ReactDOM.render(
        React.createElement(GucciAdmin, { curation: @curation })
        $('#react-root')[0]
      )
    else if @curation.get('type') is 'display-admin'
      ReactDOM.render(
        React.createElement(DisplayAdmin.default, { curation: @curation })
        $('#react-root')[0]
      )
    else
      new AdminEditView
        model: @curation
        el: $('body')
        onDeleteUrl: '/settings/curations'
    @initMenuState() if @curation.get('type') is 'editorial-feature' or 'display-admin'

  initMenuState: =>
    $('.page-header').addClass 'sticky'
    $('.settings-edit-feature').fadeIn()

  revealSection: (e) ->
    $(e.target).next().toggleClass('active').slideToggle()

module.exports.init = ->
  new CurationEditView
    el: $('body')