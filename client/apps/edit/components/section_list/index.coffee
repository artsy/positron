#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

SectionText = require '../section_text/index.coffee'
SectionTool = require '../section_tool/index.coffee'
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
            (switch section.get 'type'
              when 'text'
                SectionText {
                  section: section
                  key: i
                  ref: 'text' + i
                  editing: @state.editingIndex is i
                  onSetEditing: @onSetEditing
                }
            )
            SectionTool { sections: @props.sections, index: i }
          ]