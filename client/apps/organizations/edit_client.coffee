AdminEditView = require '../../components/admin_form/index.coffee'
Organization = require '../../models/organization.coffee'
sd = require('sharify').data

@init = ->
  new AdminEditView
    model: new Organization(sd.ORGANIZATION)
    el: $('body')
    onDeleteUrl: '/organizations'
