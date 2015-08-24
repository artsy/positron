AdminEditView = require '../../components/admin_form/index.coffee'
BrandPartner = require '../../models/brand_partner.coffee'
sd = require('sharify').data

@init = ->
  new AdminEditView
    model: new BrandPartner(sd.BRAND_PARTNER)
    el: $('body')
    onDeleteUrl: '/brand-partners'