#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

React = require 'react'
SectionContainer = React.createFactory require '../section_container/index.coffee'
SectionTool = React.createFactory require '../section_tool/index.coffee'
{ div } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { editingIndex: null }

  componentDidMount: ->
    @props.sections.on 'add remove reset', => @forceUpdate()
    @props.sections.on 'add', @onNewSection

  componentDidUpdate: ->
    $(@getDOMNode()).find('.scribe-marker').remove()

  onSetEditing: (i) ->
    @setState editingIndex: i

  onNewSection: (section) ->
    @setState editingIndex: @props.sections.indexOf section

  render: ->
    div {},
      div {
        className: 'edit-section-list' +
          (if @props.sections.length then ' esl-children' else '')
        ref: 'sections'
      },
        SectionTool { sections: @props.sections, index: -1 }
        @props.sections.map (section, i) =>
          [
            SectionContainer {
              sections: @props.sections
              section: section
              index: i
              editing: @state.editingIndex is i
              ref: 'section' + 1
              key: section.cid
              onSetEditing: @onSetEditing
            }
            SectionTool { sections: @props.sections, index: i }
          ]
