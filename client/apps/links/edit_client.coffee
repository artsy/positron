AdminEditView = require '../../components/admin_form/index.coffee'
LinkSet = require '../../models/link_set.coffee'
sd = require('sharify').data

@init = ->
  new AdminEditView
    model: new LinkSet(sd.LINK_SET)
    el: $('body')
    onDeleteUrl: '/links'
