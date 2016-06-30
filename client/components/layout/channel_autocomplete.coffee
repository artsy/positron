{ defer } = require 'underscore'
Modal = require 'simple-modal'
sd = require('sharify').data

module.exports.init = ->
  $('#layout-sidebar-switch-channel').click ->
    modal = Modal
      title: 'Switch Channel'
      content: "<input placeholder='Search by channel name...'>"
      removeOnClose: true
      buttons: [
        { text: 'Cancel', closeOnClick: true }
        { className: 'simple-modal-close', closeOnClick: true }
      ]

    $el = $(modal.m).find('input')
    channels = new Bloodhound
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
      queryTokenizer: Bloodhound.tokenizers.whitespace
      remote:
        url: "#{sd.API_URL}/channels?user_id=#{sd.USER.id}&q=%QUERY"
        filter: (channels) -> for channel in channels.results
          { id: channel.id, value: channel.name }
        ajax:
          beforeSend: =>
            $el.closest('.twitter-typeahead').addClass 'is-loading'
          complete: =>
            $el.closest('.twitter-typeahead').removeClass 'is-loading'
    partners = new Bloodhound
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
      queryTokenizer: Bloodhound.tokenizers.whitespace
      remote:
        url: "#{sd.ARTSY_URL}/api/v1/match/partners?term=%QUERY"
        filter: (partners) -> for partner in partners
          { id: partner._id, value: partner.name }
        ajax:
          beforeSend: =>
            $el.closest('.twitter-typeahead').addClass 'is-loading'
          complete: =>
            $el.closest('.twitter-typeahead').removeClass 'is-loading'
    channels.initialize()
    partners.initialize()

    $el.typeahead null,
      name: 'channels'
      source: channels.ttAdapter()
      templates: {}
    ,
      name: 'partners'
      source: partners.ttAdapter()
      templates: {}

    $el.on 'typeahead:selected', (e, item) =>
      location.assign '/switch_channel/' + item.id
    defer -> $(modal.m).find('input').focus()