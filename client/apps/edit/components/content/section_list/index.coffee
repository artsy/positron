#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

React = require 'react'
SectionContainer = React.createFactory require '../section_container/index.coffee'
SectionTool = React.createFactory require '../section_tool/index.coffee'
DragContainer = React.createFactory require '../../../../../components/drag_drop/index.coffee'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'SectionList'

  getInitialState: ->
    editingIndex: null

  componentDidMount: ->
    @props.sections.on 'add', @onNewSection
    @props.sections.on 'remove', @onRemoveSection

  onSetEditing: (i) ->
    debugger
    @setState editingIndex: i

  onNewSection: (section) ->
    @setState editingIndex: @props.sections.indexOf section
    debugger

  onRemoveSection: ->
    if @props.sections.isEmpty()
      @props.article.set 'sections', []

  onDragEnd: (sections) ->
    @props.sections.reset sections
    @forceUpdate() if @props.article.get 'published'

  isDraggable: ->
    if @state.editingIndex or @state.editingIndex is 0 then false else true

  render: ->
    div {
      className: 'edit-section-list' +
        (if @props.sections.length then ' esl-children' else '')
      ref: 'sections'
    },
      SectionTool { sections: @props.sections, index: -1, key: 1 }
      if @props.sections.length > 0
        DragContainer {
          items: @props.sections.models
          onDragEnd: @onDragEnd
          isDraggable: @isDraggable()
          layout: 'vertical'
        },
          @props.sections.map (section, i) =>
            [
              SectionContainer {
                sections: @props.sections
                section: section
                index: i
                editing: @state.editingIndex is i
                ref: 'section' + i
                key: section.cid
                channel: @props.channel
                onSetEditing: @onSetEditing
              }
              SectionTool { sections: @props.sections, index: i, key: i }
            ]
