AdminEditView = require '../../components/admin_form/index.coffee'
Vertical = require '../../models/vertical.coffee'
sd = require('sharify').data

@init = ->
  new AdminEditView
    model: new Vertical(sd.VERTICAL)
    el: $('body')
