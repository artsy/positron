Backbone = require('backbone')
{ AdminEditView } = require '../../../components/admin_form/index.coffee'
Curation = require '../../../models/curation.coffee'
sd = require('sharify').data
_ = require('underscore')


module.exports.CurationEditView = class CurationEditView extends Backbone.View

  events:
    'click .edit-feature__section-title': 'revealSection'

  initialize: ->
    @curation = new Curation sd.CURATION
    new AdminEditView
      model: @curation
      el: $('body')
      onDeleteUrl: '/settings/curations'
    if this.curation.get('type') == "editorial-feature"
      @initMenuState()

  initMenuState: =>
    $('.page-header').addClass 'sticky'
    $('.edit-feature').fadeIn()

  revealSection: (e) ->
    $(e.target).next().toggleClass('active').slideToggle()

module.exports.init = ->
  new CurationEditView
    el: $('body')