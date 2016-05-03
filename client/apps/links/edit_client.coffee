AdminEditView = require '../../components/admin_form/index.coffee'
LinkSet = require '../../models/link_set.coffee'
sd = require('sharify').data
_s = require 'underscore.string'

@init = ->
  new AdminEditView
    model: new LinkSet(sd.LINK_SET)
    el: $('body')
    onDeleteUrl: '/links'

  $('input[name=slug]').on 'change', ->
    slug = $(this).val()
    $(this).val _s.slugify slug
