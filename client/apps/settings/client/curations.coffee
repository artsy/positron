AdminEditView = require '../../../components/admin_form/index.coffee'
Curation = require '../../../models/curation.coffee'
sd = require('sharify').data
_s = require 'underscore.string'

@init = ->
  new AdminEditView
    model: new Curation(sd.CURATION)
    el: $('body')
    onDeleteUrl: '/settings/curations'
