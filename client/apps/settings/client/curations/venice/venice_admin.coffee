React = require 'react'
ReactDOM = require 'react-dom'
_ = require 'underscore'
{ div, section, label, span, textarea, button } = React.DOM
dropdownHeader = React.createFactory require '../../../../edit/components/admin/components/dropdown_header.coffee'
sectionFields = React.createFactory require './venice_section.coffee'
AutocompleteList = React.createFactory require '../../../../../components/autocomplete_list/index.coffee'


module.exports = VeniceAdmin = React.createClass
  displayName: 'VeniceAdmin'

  getInitialState: ->
    curation: @props.curation
    activeSections: []
    isChanged: false
    isSaving: false
    error: null

  revealSection: (section) ->
    sections = @state.activeSections
    if section in @state.activeSections
      sections = _.without(sections, section)
      @setState activeSections: sections
    else
      sections.push(section)
      @setState activeSections: sections

  getActiveSection: (section) ->
    active = if section in @state.activeSections then ' active' else ''
    return active

  isActiveSection: (section) ->
    active = if section in @state.activeSections then true else false
    return active

  onChangeSection: (section, id) ->
    @setState isChanged: true
    newSections = @state.curation.get 'sections'
    newSections[id] = section
    @state.curation.set 'sections', newSections

  onDescriptionChange: (e) ->
    @onChange e.target.name, e.target.value

  onChange: (key, value) ->
    @setState isChanged: true
    @state.curation.set key, value

  save: ->
    @setState isSaving: true
    @state.curation.save {},
      success: =>
        @setState isSaving: false, isChanged: false
      error: (err) ->
        @setState error: err, isSaving: false

  printSections: ->
    @state.curation.get('sections').map (s, i) =>
      section {key: 'section-' + i, className: @getActiveSection 'section-' + i },
        dropdownHeader {
          section: s.title || 'Missing Title'
          onClick: @revealSection
          key: 'section-' + i
          className: 'section-' + i
        }
        if @isActiveSection 'section-' + i
          sectionFields {
            section: s
            id: i
            onChange: @onChangeSection
          }

  printError: ->
    if @state.error
      div { className: 'error' }, '* ' + @state.error

  getSaveStatus: ->
    className = ''
    text = 'Save'
    if @state.isSaving
      className = ' is-saving'
      text = 'Saving...'
    else if @state.isChanged
      className = ' attention'
    { className: className, text: text }

  render: ->
    div {},
      div { className: 'save' },
        button {
          className: 'avant-garde-button' + @getSaveStatus().className
          ref: 'save'
          onClick: @save
        }, @getSaveStatus().text
      @printError()
      @printSections()
      div { className: 'field-group about' },
        label {},
          span {},'About the Series'
          span { className: 'subtitle' }, 'Accepts Markdown'
        textarea {
          className: 'bordered-input'
          placeholder: 'Description'
          name: 'description'
          defaultValue: @state.curation.get 'description'
          onChange: @onDescriptionChange
        }
      div {className: 'field-group sub-articles'},
        label {}, 'Related Articles'
        AutocompleteList {
          url: "#{sd.API_URL}/articles?published=true&q=%QUERY"
          placeholder: "Search articles by title..."
          filter: (articles) ->
            for article in articles.results
              { id: article.id, value: "#{article.title}, #{article.author?.name}"}
          selected: (e, item, items) =>
            subArticles = _.pluck items, 'id'
            @onChange 'sub_articles', subArticles
          removed: (e, item, items) =>
            subArticles = _.without(_.pluck(items,'id'),item.id)
            @onChange 'sub_articles', subArticles
          idsToFetch: @state.curation.get 'sub_articles'
          fetchUrl: (id) -> "#{sd.API_URL}/articles/#{id}"
          resObject: (res) ->
            id: res.body.id, value: "#{res.body.title}, #{res.body.author?.name}"
        }