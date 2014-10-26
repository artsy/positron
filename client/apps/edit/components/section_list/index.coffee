#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

SectionContainer = -> require('../section_container/index.coffee') arguments...
SectionTool = -> require('../section_tool/index.coffee') arguments...
React = require 'react'
{ div } = React.DOM

module.exports = React.createClass

  getInitialState: ->
    { editingIndex: null }

  componentDidMount: ->
    @props.sections.on 'remove', => @forceUpdate()
    @props.sections.on 'add', @onNewSection

  componentWillUnmount: ->
    @props.sections.off()

  onSetEditing: (i) ->
    @setState editingIndex: i

  onNewSection: (section) ->
    @setState editingIndex: @props.sections.indexOf section

  render: ->
    div {},
      div { className: 'edit-section-list', ref: 'sections' },
        SectionTool { sections: @props.sections }
        @props.sections.map (section, i) =>
          [
            SectionContainer {
              section: section
              key: i
              editing: @state.editingIndex is i
              ref: 'section' + 1
              onSetEditing: @onSetEditing
            }
            SectionTool { sections: @props.sections, index: i }
          ]
