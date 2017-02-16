React = require 'react'
window.global = window
window.process = {env: {NODE_ENV: 'development'}}

{ convertToRaw,
  convertFromHTML,
  CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  RichUtils,
  getVisibleSelectionRect } = require 'draft-js'
{ stateToHTML } = require 'draft-js-export-html'

DraftDecorators = require './draft_decorators.coffee'

LinkIcon = React.createFactory require '../../apps/edit/public/icons/edit_text_link.coffee'

{ div, button, p, a, input } = React.DOM
editor = (props) -> React.createElement Editor, props

decorator = new CompositeDecorator([
    {
      strategy: DraftDecorators.findLinkEntities
      component: DraftDecorators.Link
    }
  ])

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
      @setState editorState: EditorState.createWithContent(state, decorator)

  onChange: (editorState) ->
    console.log 'changed'
    html = @getHtml editorState
    @setState editorState: editorState, html: html
    console.log html

  focus: ->
    @refs.editor.focus()

  getHtml: (editorState) ->
    stateToHTML editorState.getCurrentContent()

  onStyleChange: (e) ->
    @onChange RichUtils.toggleInlineStyle(@state.editorState, e.target.id)

  onURLChange: (e) ->
    @setState urlValue: e.target.value

  promptForLink: (e) ->
    selection = @state.editorState.getSelection()
    if !selection.isCollapsed()
      contentState = @state.editorState.getCurrentContent()
      startKey = selection.getStartKey()
      startOffset = selection.getStartOffset()
      blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
      linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)

      url = ''
      if linkKey
        linkInstance = contentState.getEntity(linkKey)
        url = linkInstance.getData().url
      @setState({showUrlInput: true, urlValue: url})

  confirmLink: (e) ->
    e.preventDefault()
    { editorState, urlValue } = @state
    contentState = editorState.getCurrentContent()
    contentStateWithEntity = contentState.createEntity(
      'LINK'
      'MUTABLE'
      {url: urlValue}
    )
    entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity })
    @setState({
      editorState: RichUtils.toggleLink(
        newEditorState
        newEditorState.getSelection()
        entityKey
      )
      showUrlInput: false
      urlValue: ''
    })

  printUrlInput: ->
    if @state.showUrlInput
      div { className: 'draft-caption__url-input' },
        input {
          ref: 'url'
          type: 'text'
          value: @state.urlValue
          onChange: @onURLChange
        }
        button {
          onMouseDown: @confirmLink
        }, "Apply"

  render: ->
    div { className: 'draft-caption' },
      div { className: 'draft-caption__input bordered-input' },
        editor {
          ref: 'editor'
          placeholder: 'Image caption'
          editorState: @state.editorState
          onChange: @onChange
        }
      div { className: 'draft-caption__actions'},
        button {
          onMouseDown: @onStyleChange
          id: 'ITALIC'
        }, 'I'
        button {
          onMouseDown: @promptForLink
        },
          LinkIcon {}
      @printUrlInput()
