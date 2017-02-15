React = require 'react'
window.global = window
# Draft = require 'draft-js'
{ convertToRaw,
  convertFromHTML,
  CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  RichUtils,
  getVisibleSelectionRect } = require 'draft-js';

{ div, button, p } = React.DOM
editor = (props) -> React.createElement Editor, props


module.exports = React.createClass
  displayName: 'DraftInput'

  getInitialState: ->
    editorState: EditorState.createEmpty()
    showUrlInput: false
    urlValue: ''
    html: null

  componentDidMount: ->
    if @props.item.caption.length
      blocksFromHTML = convertFromHTML(@props.item.caption)
      state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks
        blocksFromHTML.entityMap
       )
      @setState editorState: EditorState.createWithContent(state)

  onChange: (editorState) ->
    @setState editorState: editorState

  onStyleChange: (e) ->
    @onChange RichUtils.toggleInlineStyle(@state.editorState, e.target.id)

  render: ->
    div {},
      editor {
        ref: 'editor'
        placeholder: 'caption here'
        editorState: @state.editorState
        onChange: @onChange
      }
      button {
        onMouseDown: @onStyleChange
        id: 'BOLD'
      }, 'BOLD'