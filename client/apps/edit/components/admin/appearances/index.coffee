_ = require 'underscore'
React = require 'react'
ReactDOM = require 'react-dom'
{ div, label } = React.DOM
sd = require('sharify').data
AutocompleteSelect = React.createFactory require '../../../../../components/autocomplete_select/index.coffee'
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'

module.exports = React.createClass
  displayName: 'AdminAppearances'

  componentDidMount: ->
    ReactDOM.findDOMNode(@refs.container).classList += ' active'

  render: ->
    div { className: 'edit-admin--appearances edit-admin__fields', ref: 'container'},
      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'Fair Programming'
            AutocompleteList {
              url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
              placeholder: "Search fairs by name..."
              filter: (res) -> for r in res
                { id: r._id, value: r.name }
              selected: (e, item, items) =>
                @props.onChange 'fair_programming_ids', _.pluck items, 'id'
              removed: (e, item, items) =>
                @props.onChange 'fair_programming_ids', _.without(_.pluck(items, 'id'),item.id)
              idsToFetch: @props.article.get 'fair_programming_ids'
              fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/fair/#{id}"
              resObject: (res) ->
                id: res.body._id, value: res.body.name
            }
        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {}, 'Artsy at the Fair'
            AutocompleteList {
              url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
              placeholder: "Search fairs by name..."
              filter: (res) -> for r in res
                { id: r._id, value: r.name }
              selected: (e, item, items) =>
                @props.onChange 'fair_artsy_ids', _.pluck items, 'id'
              removed: (e, item, items) =>
                @props.onChange 'fair_artsy_ids', _.without(_.pluck(items, 'id'),item.id)
              idsToFetch: @props.article.get 'fair_artsy_ids'
              fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/fair/#{id}"
              resObject: (res) ->
                id: res.body._id, value: res.body.name
            }
      div {className: 'fields-full'},
        div {className: 'fields-left'},
          div {className: 'field-group'},
            label {}, 'About the Fair'
            AutocompleteList {
              url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
              placeholder: "Search fairs by name..."
              filter: (res) -> for r in res
                { id: r._id, value: r.name }
              selected: (e, item, items) =>
                @props.onChange 'fair_about_ids', _.pluck items, 'id'
              removed: (e, item, items) =>
                @props.onChange 'fair_about_ids', _.without(_.pluck(items, 'id'),item.id)
              idsToFetch: @props.article.get 'fair_about_ids'
              fetchUrl: (id) -> "#{sd.ARTSY_URL}/api/v1/fair/#{id}"
              resObject: (res) ->
                id: res.body._id, value: res.body.name
            }
        div {className: 'fields-right'},
          div {className: 'field-group'},
            label {}, 'Extended Artist Biography'
            AutocompleteSelect {
              url: "#{sd.ARTSY_URL}/api/v1/match/artists?term=%QUERY"
              placeholder: 'Search artist by name...'
              filter: (res) -> for r in res
                { id: r._id, value: r.name }
              selected: (e, item) =>
                @props.onChange 'biography_for_artist_id', item.id
              removed: =>
                @props.onChange 'biography_for_artist_id', null
              idToFetch: @props.article.get('biography_for_artist_id')
              fetchUrl: sd.ARTSY_URL + '/api/v1/artist/' + @props.article.get('biography_for_artist_id')
              resObject: (res) ->
                value: res.body.name, id: res.body.id
            }