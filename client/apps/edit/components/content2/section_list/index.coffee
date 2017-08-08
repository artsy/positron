#
# Top-level component that manages the section tool & the various individual
# section components that get rendered.
#

React = require 'react'
SectionContainer = React.createFactory require '../section_container/index.coffee'
SectionTool = React.createFactory require '../section_tool/index.coffee'
DragContainer = React.createFactory require '../../../../../components/drag_drop/index.coffee'
RichTextParagraph = React.createFactory require '../../../../../components/rich_text/components/input_paragraph.coffee'
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
    html = null if html is '<p></p>'
    @props.article.set('postscript', html)
    @props.saveArticle()

  render: ->
    div {
      className: 'edit-sections__list' +
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
          article: @props.article
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
                article: @props.article
              }
              SectionTool { sections: @props.sections, index: i, key: i }
            ]
      if @props.channel.isEditorial()
        div {
          className: 'edit-sections__postscript'
          'data-layout': 'column_width'
        },
          RichTextParagraph {
            text: @props.article.get('postscript') or ''
            onChange: @setPostscript
            placeholder: 'Postscript (optional)'
          }
