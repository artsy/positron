React = require 'react'
ReactDOM = require 'react-dom'
{ div, input, label, section, textarea } = React.DOM
dropdownHeader = React.createFactory require '../../../edit/components/admin/components/dropdown_header.coffee'
sectionFields = React.createFactory require './venice_section.coffee'

module.exports = VeniceAdmin = React.createClass
  displayName: 'VeniceAdmin'

  getInitialState: ->
    curation: @props.curation
    activeSections: []

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

  printSections: ->
    @state.curation.get('sections').map (s, i) =>
      section {key: 'section-' + i, className: @getActiveSection 'section-' + i },
        dropdownHeader {
          section: s.title
          onClick: @revealSection
          key: 'section-' + i
          className: 'section-' + i
        }
        if @isActiveSection 'section-' + i
          sectionFields {
            section: s
          }

  render: ->
    div {},
      @printSections()
      div { className: 'field-group' },
        label {}, 'About the Series'
        textarea {
          className: 'bordered-input'
          placeholder: 'Description'
        }