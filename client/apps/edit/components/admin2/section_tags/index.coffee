React = require 'react'
ReactDOM = require 'react-dom'
{ div, label, button, input } = React.DOM


SECTIONS = ['Art', 'Art Market', 'Culture', 'Creativity']
SUBSECTIONS = [
  ['Art World', 'Art History', 'Artists']
  ['Collecting', 'Market Analysis', 'Art Industry']
  ['Visual Culture', 'Photography', 'Politics', 'Architecture', 'Design']
  ['Innovation', 'Inspiration', 'Business', 'Wellness']
]

module.exports = React.createClass
  displayName: 'AdminSections'

  getInitialState: ->
    section: null
    subSections: null
    subSection: null

  printButtons: (buttons, handleToggle) ->
    if buttons
      buttons.map (tag, i) =>
        active = ''
        if @state.section is tag or @state.subSection is tag
          active = ' avant-garde-button-black'
        button {
          key: i
          name: tag
          onClick: handleToggle
          className: 'avant-garde-button' + active
        }, tag
      , @
    else
      button {
        className: 'avant-garde-button disabled'
        }, 'Please select a section first'

  subSectionToggle: (e)->
    @setState subSection: e.target.name

  sectionToggle: (e) ->
    active = SECTIONS.indexOf e.target.name
    @setState
      section: e.target.name
      subSections: SUBSECTIONS[active]

  render: ->
    div { className: 'edit-admin--section-tags edit-admin__fields'},
      div {className: 'fields-left'},
        div { className: 'field-group' },
          label {}, 'Editorial Section'
          @printButtons SECTIONS, @sectionToggle
        div { className: 'field-group' },
          label {}, 'Editorial SubSection'
          @printButtons @state.subSections, @subSectionToggle
      div {className: 'fields-right'},
        div {className: 'field-group'},
          label {}, 'Topic Tags'
          input {
            className: 'bordered-input'
            placeholder: 'Start typing a topic tag...'
          }
        div {className: 'field-group'},
          label {}, 'Tracking Tags'
          input {
            className: 'bordered-input'
            placeholder: 'Start typing a tracking tag...'
          }