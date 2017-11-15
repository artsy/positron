#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

React = require 'react'
SectionContainer = React.createFactory require '../section_container/index.coffee'
SectionTool = require '../section_tool/index.jsx'
DragContainer = React.createFactory require '../../../../../components/drag_drop/index.coffee'
Paragraph = React.createFactory require '../../../../../components/rich_text2/components/paragraph.coffee'
{ div } = React.DOM

module.exports = React.createClass
  displayName: 'SectionList'

  getInitialState: ->
    editingIndex: null

  componentDidMount: ->
    @props.sections.on 'add', @onNewSection
    @props.sections.on 'remove', @onRemoveSection

  onSetEditing: (i) ->
    @setState editingIndex: i

  onNewSection: (section) ->
    @setState editingIndex: @props.sections.indexOf section

  onRemoveSection: ->
    if @props.sections.isEmpty()
      @props.article.set 'sections', []
    @forceUpdate()

  onDragEnd: (sections) ->
    @props.sections.reset sections
    @forceUpdate() if @props.article.get 'published'

  isDraggable: ->
    if @state.editingIndex or @state.editingIndex is 0 then false else true

  setPostscript: (html) ->
    html = null unless html.length
    @props.article.set('postscript', html)
    @props.saveArticle()

  render: ->
    div {
      className: 'edit-sections__list'
      ref: 'sections'
    },
      React.createElement(
        SectionTool.default,
        {
          sections: @props.sections
          index: -1
          key: 1
          isEditing: @state.editingIndex isnt null
          firstSection: true
          isDraggable: false
        }
      )
      if @props.sections.length
        DragContainer {
          items: @props.sections.models
          onDragEnd: @onDragEnd
          isDraggable: @isDraggable()
          layout: 'vertical'
          article: @props.article
        },
          @props.sections.map (section, i) =>
             unless section.get('type') is 'callout'
              [
                SectionContainer {
                  sections: @props.sections
                  section: section
                  index: i
                  editing: @state.editingIndex is i
                  ref: 'section-' + i
                  key: section.cid
                  channel: @props.channel
                  onSetEditing: @onSetEditing
                  article: @props.article
                }
                React.createElement(
                  SectionTool.default,
                  {
                    sections: @props.sections
                    index: i
                    key: 'tool-' + i
                    isEditing: @state.editingIndex isnt null
                    isDraggable: false
                  }
                )
              ]
      if @props.channel.isEditorial()
        div {
          className: 'edit-sections__postscript'
          'data-layout': 'column_width'
        },
          Paragraph {
            html: @props.article.get('postscript') or ''
            onChange: @setPostscript
            placeholder: 'Postscript (optional)'
            type: 'postscript'
            linked: true
            layout: @props.article.get('layout')
          }
      # TODO - Author Preview
