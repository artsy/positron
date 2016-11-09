Backbone = require('backbone')
AdminEditView = require '../../../components/admin_form/index.coffee'
Curation = require '../../../models/curation.coffee'
sd = require('sharify').data
_ = require('underscore')

module.exports = class CurationEditView extends Backbone.View

  events:
    'keyup input': 'saveCuration'

  initialize: ->
    @curation = new Curation(sd.CURATION)
    new AdminEditView
      model: @curation
      el: $('body')
      onDeleteUrl: '/settings/curations'

  saveCuration: ->
    debugger
    # take all the form elements and serialize them
    @curation.save()
