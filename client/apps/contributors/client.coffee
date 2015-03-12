_ = require 'underscore'
Backbone = require 'backbone'
{ openErrorModal } = require '../../components/error_modal/index.coffee'
User = require '../../models/user.coffee'
Users = require '../../collections/users.coffee'
sd = require('sharify').data
listTemplate = -> require('./templates/list.jade') arguments...

module.exports.ContributorsView = class ContributorsView extends Backbone.View

  initialize: ({ @users }) ->
    @users.on 'add', @render
    @setupAutocomplete()
    @$('input').focus()

  setupAutocomplete: ->
    Autocomplete = require '../../components/autocomplete/index.coffee'
    new Autocomplete
      el: $('#contributors-add input')
      url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
      filter: (res) -> for r in res
        { id: r.id, value: _.compact([r.name, r.email]).join(', ')  }
      selected: @onSelect

  onSelect: (e, selected) =>
    new User().save { artsy_id: selected.id },
      error: openErrorModal
      success: (user) => @users.add user, at: 0
    @renderSpinner()

  renderSpinner: ->
    @$('tbody').prepend """
      <tr class='lite-table-spinner-tr'>
        <td colspan=5 style='padding: 41px 0'>
          <div class='loading-spinner-small'></div>
        </td>
      </tr>
    """

  render: =>
    @$('tbody').html listTemplate users: @users.models

module.exports.init = ->
  new ContributorsView el: $('body'), users: new Users sd.USERS