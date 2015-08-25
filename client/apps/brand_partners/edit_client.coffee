_ = require 'underscore'
Backbone = require 'backbone'
request = require 'superagent'
AdminEditView = require '../../components/admin_form/index.coffee'
BrandPartner = require '../../models/brand_partner.coffee'
sd = require('sharify').data

@init = ->
  @brandPartner = new BrandPartner(sd.BRAND_PARTNER)
  new AdminEditView
    model: @brandPartner
    el: $('body')
    onDeleteUrl: '/brand-partners'

  AutocompleteSelect = require '../../components/autocomplete_select/index.coffee'
  select = AutocompleteSelect $('.admin-form-autocomplete-partner')[0],
    label: "Partner Id"
    name: 'partner_id'
    url: "#{sd.ARTSY_URL}/api/v1/match/partners?term=%QUERY"
    placeholder: 'Search partner by name...'
    filter: (res) -> for r in res
      { id: r._id, value: r.name }
  if id = @brandPartner.get('partner_id')
    request
      .get("#{sd.ARTSY_URL}/api/v1/partner/#{id}")
      .set('X-Access-Token': sd.USER.access_token).end (err, res) ->
        select.setState value: res.body.name, loading: false
  else
    select.setState loading: false