React = require 'react'
ReactDOM = require 'react-dom'
async = require 'async'
request = require 'superagent'
sd = require('sharify').data
_ = require 'underscore'
{ div, label, input, form, span } = React.DOM
AutocompleteList = require '../../../../../components/autocomplete_list/index.coffee'

module.exports = React.createClass
  displayName: 'AdminAutocomplete'

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
    @list = new AutocompleteList $(@refs['autocomplete'])[0],
      name: field + '[]'
      url: url
      placeholder: "Search #{fieldSingle} by name..."
      filter: (res) -> for r in res
        { id: r._id, value: r.name }
      selected: (e, item, items) =>
        @props.onChange field, _.pluck items, 'id'
      removed: (e, item, items) =>
        @props.onChange field, _.without(_.pluck(items, 'id'),item.id)
    if ids = @props.article.get field
      fieldSingle = if field isnt 'auction_ids' then fieldSingle else 'sale'
      @ids = []
      async.each ids, (id, cb) =>
        request
          .get("#{sd.ARTSY_URL}/api/v1/#{fieldSingle}/#{id}")
          .set('X-Access-Token': sd.USER.access_token).end (err, res) =>
            @ids.push id: res.body._id, value: res.body.name
            cb()
      , =>
        @list.setState loading: false, items: @ids
    else
      @list.setState loading: false

  render: ->
    div { ref: 'autocomplete' }