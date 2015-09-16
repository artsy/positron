AdminEditView = require '../../components/admin_form/index.coffee'
FeatureSection = require '../../models/feature_section.coffee'
sd = require('sharify').data

@init = ->
  new AdminEditView
    model: new FeatureSection(sd.SECTION)
    el: $('body')
    onDeleteUrl: '/sections'