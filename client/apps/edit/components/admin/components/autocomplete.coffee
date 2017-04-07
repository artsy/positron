React = require 'react'
ReactDOM = require 'react-dom'
async = require 'async'
request = require 'superagent'
sd = require('sharify').data
_ = require 'underscore'
{ div, label, input, form, span } = React.DOM
AutocompleteList = require '../../../../../components/autocomplete_list/index.coffee'

module.exports = React.createClass
  displayName: 'AdminAutocompleteList'

  componentDidMount: ->
    @setupAutocomplete(@props.field)

  componentWillUnmount: ->
    $(@refs['autocomplete']).each (i, ref) ->
      ReactDOM.unmountComponentAtNode(ref)

  setupAutocomplete: (field) ->
    fieldSingle = field
      .replace('_ids', '')
      .replace('_artsy', '')
      .replace('_about', '')
      .replace('_programming', '')
    fieldPlural = fieldSingle + 's'
    return unless @props.channel.hasAssociation fieldPlural
    fieldPlural = if field isnt 'auction_ids' then fieldPlural else 'sales'
    url = "#{sd.ARTSY_URL}/api/v1/match/#{fieldPlural}?term=%QUERY"
    new AutocompleteList $(@refs['autocomplete'])[0],
      url: url
      placeholder: "Search #{fieldSingle} by name..."
      filter: (res) -> for r in res
        { id: r._id, value: r.name }
      selected: (e, item, items) =>
        @props.onChange field, _.pluck items, 'id'
      removed: (e, item, items) =>
        @props.onChange field, _.without(_.pluck(items, 'id'),item.id)
      idsToFetch: @props.article.get field
      fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/#{fieldSingle}/#{id}"
      resObject: (res) ->
        id: res.body._id, value: res.body.name

  render: ->
    div { ref: 'autocomplete' }