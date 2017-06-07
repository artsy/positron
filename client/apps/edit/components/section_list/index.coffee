#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

React = require 'react'
SectionContainer = React.createFactory require '../section_container/index.coffee'
SectionTool = React.createFactory require '../section_tool/index.coffee'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'SectionList'

  getInitialState: ->
    editingIndex: null
    dragging: null
    dragOver: null
    dragStartY: null
    draggingHeight: 0

  componentDidMount: ->
    @props.sections.on 'add remove reset', => @props.saveArticle()
    @props.sections.on 'add', @onNewSection

  onSetEditing: (i) ->
    @setState editingIndex: i

  onNewSection: (section) ->
    @setState editingIndex: @props.sections.indexOf section

  onDragStart: (e, dragStartY) ->
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget)
    $dragged = $(e.currentTarget).find('.edit-section-container')
    @setState
      dragStartY: dragStartY
      dragging: $dragged.data('id')
      draggingHeight: $dragged.height() - 20

  onDragEnd: ->
    newSections = @props.sections.models
    removed = newSections.splice @state.dragging, 1
    newSections.splice @state.dragOver, 0, removed[0]
    @props.sections.reset newSections
    @setState
      dragging: null
      dragOver: null
      draggingHeight: 0
      dragStartY: null

  onSetDragOver: (sectionId) ->
    @setState dragOver: sectionId

  render: ->
    div {},
      div {
        className: 'edit-section-list' +
          (if @props.sections.length then ' esl-children' else '')
        ref: 'sections'
      },
        SectionTool { sections: @props.sections, index: -1, key: 1}
        @props.sections.map (section, i) =>
          [
            SectionContainer {
              sections: @props.sections
              section: section
              index: i
              editing: @state.editingIndex is i
              ref: 'section' + i
              key: section.cid
              onSetEditing: @onSetEditing
              onSetDragOver: @onSetDragOver
              onDragStart: @onDragStart
              onDragEnd: @onDragEnd
              dragOver: @state.dragOver
              dragging: @state.dragging
              draggingHeight: @state.draggingHeight
              dragStartY: @state.dragStartY
            }
            SectionTool { sections: @props.sections, index: i, key: i}
          ]
