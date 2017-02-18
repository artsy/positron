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
RemoveIcon = React.createFactory require '../../apps/edit/public/icons/edit_section_remove.coffee'

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
    focus: false

  componentDidMount: ->
    if @props.item.caption?.length
      blocksFromHTML = convertFromHTML(@props.item.caption)
      state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks
        blocksFromHTML.entityMap
       )
      @setState editorState: EditorState.createWithContent(state, decorator)

  onChange: (editorState) ->
    html = @getHtml editorState
    @setState editorState: editorState, html: html
    @props.item.caption = html

  focus: ->
    @setState focus: true
    @refs.editor.focus()

  onBlur: ->
    @setState focus: false

  getHtml: (editorState) ->
    stateToHTML editorState.getCurrentContent()

  onStyleChange: (e) ->
    @onChange RichUtils.toggleInlineStyle(@state.editorState, e.target.id)
    @focus()

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
    newEditorState = EditorState.set editorState, { currentContent: contentStateWithEntity }
    @setState({
      showUrlInput: false
      urlValue: ''
    })
    @onChange RichUtils.toggleLink(
        newEditorState
        newEditorState.getSelection()
        entityKey
      )

  removeLink: (e) ->
    debugger
    e.preventDefault()
    { editorState } = @state
    selection = editorState.getSelection()
    if !selection.isCollapsed()
      @setState({
        showUrlInput: false
        urlValue: ''
        editorState: RichUtils.toggleLink(editorState, selection, null)
      })

  printUrlInput: ->
    if @state.showUrlInput
      div { className: 'draft-caption__url-input' },
        input {
          ref: 'url'
          type: 'text'
          value: @state.urlValue
          onChange: @onURLChange
          className: 'bordered-input'
          placeholder: 'Paste or type a link'
        }
        if @state.urlValue?.length
          button {
            onMouseDown: @removeLink
          }, 'X'
        button {
          onMouseDown: @confirmLink
        }, 'Apply'

  render: ->
    hasFocus = if @state.focus then ' has-focus' else ' no-focus'

    div { className: 'draft-caption' },
      div {
        className: 'draft-caption__input bordered-input' + hasFocus
        onClick: @focus
        onBlur: @onBlur
      },
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
