_ = require 'underscore'
Backbone = require 'backbone'
Modal = -> require('../../components/simple-modal') arguments...
sd = require('sharify').data
async = require 'async'
request = require 'superagent'
User = require '../../models/user.coffee'

module.exports = class AutocompleteChannels extends Backbone.View

  initialize: (options) ->
    @modal = Modal
      title: 'Switch Channel'
      content: "<input placeholder='Search by channel name...'>"
      removeOnClose: true
      buttons: [
        { text: 'Cancel', closeOnClick: true }
        { className: 'simple-modal-close', closeOnClick: true }
      ]
    @$el = $(@modal.m).find('input')
    @user = new User sd.USER

    @user.fetchPartners (partners) =>
      @setupBloodhound partners
      @setupTypeahead()

  setupBloodhound: (fetchedPartners) =>
    # Manually set up bloodhound for channels and partners
    @channels = new Bloodhound
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
      queryTokenizer: Bloodhound.tokenizers.whitespace
      remote:
        url: "#{sd.API_URL}/channels?user_id=#{sd.USER.id}&q=%QUERY&sort=name"
        filter: (channels) -> for channel in channels.results
          { id: channel.id, value: channel.name }
        ajax:
          beforeSend: =>
            @$el.closest('.twitter-typeahead').addClass 'is-loading'
          complete: =>
            @$el.closest('.twitter-typeahead').removeClass 'is-loading'
    if @user.isAdmin()
      @adminPartners = new Bloodhound
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
        queryTokenizer: Bloodhound.tokenizers.whitespace
        remote:
          url: "#{sd.ARTSY_URL}/api/v1/match/partners?term=%QUERY"
          filter: (partners) -> for partner in partners
            { id: partner._id, value: partner.name }
          ajax:
            beforeSend: =>
              @$el.closest('.twitter-typeahead').addClass 'is-loading'
            complete: =>
              @$el.closest('.twitter-typeahead').removeClass 'is-loading'
    else
      local = _.map fetchedPartners, (partner) ->
        { id: partner._id, value: partner.name}
      @partners = new Bloodhound
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value')
        queryTokenizer: Bloodhound.tokenizers.whitespace
        local: local
    @channels.initialize()
    @adminPartners?.initialize()
    @partners?.initialize()

  setupTypeahead: =>
    # Initialize typeahead with both channels and partners

    @$el.typeahead {
      highlight: true
    },
      name: 'channels'
      source: @channels.ttAdapter()
      templates:
        header: '<h3 class="autocomplete-header">Channels</h3>'
    ,
      name: 'partners'
      source: if @user.isAdmin() then @adminPartners.ttAdapter() else @partners.ttAdapter()
      templates:
        header: '<h3 class="autocomplete-header">Partners</h3>'

    @$el.on 'typeahead:selected', (e, item) =>
      location.assign '/switch_channel/' + item.id
    _.defer => $(@modal.m).find('input').focus()
