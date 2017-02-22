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
  Modifier,
  getVisibleSelectionRect } = require 'draft-js'
{ stateToHTML } = require 'draft-js-export-html'
DraftDecorators = require './draft_decorators.coffee'
LinkIcon = React.createFactory require '../../apps/edit/public/icons/edit_text_link.coffee'
RemoveIcon = React.createFactory require '../../apps/edit/public/icons/edit_text_link_remove.coffee'

{ div, button, p, a, input } = React.DOM
editor = (props) -> React.createElement Editor, props

decorator = new CompositeDecorator([
    {
      strategy: DraftDecorators.findLinkEntities
      component: DraftDecorators.Link
    }
  ])

module.exports = React.createClass
  displayName: 'DraftInputCaption'

  getInitialState: ->
    editorState: EditorState.createEmpty()
    showUrlInput: false
    urlValue: ''
    html: null
    focus: false
    selectionTarget: null

  componentDidMount: ->
    if @props.item.caption?.length
      blocksFromHTML = convertFromHTML(@props.item.caption)
      state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks
        blocksFromHTML.entityMap
       )
      @setState editorState: EditorState.createWithContent(state, decorator)

  onChange: (editorState) ->
    html = @convertToHtml editorState
    @setState editorState: editorState, html: html
    @props.item.caption = html

  focus: ->
    @setState focus: true
    @refs.editor.focus()

  onBlur: ->
    @setState focus: false

  onStyleChange: (e) ->
    e.preventDefault()
    @onChange RichUtils.toggleInlineStyle(@state.editorState, e.target.className.toUpperCase())

  onURLChange: (e) ->
    @setState urlValue: e.target.value

  convertToHtml: (editorState) ->
    console.log 'converteHtml'
    html = stateToHTML editorState.getCurrentContent()
    html = html.replace(/(\r\n|\n|\r)/gm,'').replace(/<\/p><p>/g, ' ')
    return html

  onPaste: (text, html) ->
    { editorState } = @state
    html = convertFromHTML(html)
    convertedHtml = html.contentBlocks.map (contentBlock) =>
      unstyled = @stripPastedStyles contentBlock
      console.log unstyled.getType()
      if unstyled.getType() isnt 'unstyled' or 'LINK'
        unstyled = unstyled.set('type', 'unstyled')
      return unstyled
    Modifier.removeInlineStyle(editorState.getCurrentContent(), editorState.getSelection(), 'font-weight')
    @onChange(EditorState.push(editorState, ContentState.createFromBlockArray(convertedHtml), 'insert-fragment'))
    return true

  stripPastedStyles: (contentBlock) ->
    characterList = contentBlock.getCharacterList().map (character) ->
      if character.get('style') is 'CODE' or 'BOLD'
        character.set('style', character.get('style').clear())
    unstyled = contentBlock.set('characterList', characterList)
    return unstyled

  promptForLink: (e) ->
    console.log 'link prompt clicked'
    e.preventDefault()
    selection = @state.editorState.getSelection()
    selectionTarget = null
    if !selection.isCollapsed()
      selectionTarget = @stickyLinkBox getVisibleSelectionRect(window)
      contentState = @state.editorState.getCurrentContent()
      startKey = selection.getStartKey()
      startOffset = selection.getStartOffset()
      blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
      linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)
      url = ''
      if linkKey
        linkInstance = contentState.getEntity(linkKey)
        url = linkInstance.getData().url
      @setState({showUrlInput: true, urlValue: url, selectionTarget: selectionTarget})

  stickyLinkBox: (selectionTarget) ->
    parentTop = $('.draft-caption__input').offset().top - window.pageYOffset
    parentLeft = $('.draft-caption__input').offset().left
    top = selectionTarget.top - parentTop + 25
    left = selectionTarget.left - parentLeft - (selectionTarget.width / 2) - 135
    return {top: top, left: left}

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
      selectionTarget: null
    })
    @onChange RichUtils.toggleLink(
        newEditorState
        newEditorState.getSelection()
        entityKey
      )

  removeLink: (e) ->
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
      div {
        className: 'draft-caption__url-input'
        style: {
          top: @state.selectionTarget.top
          left: @state.selectionTarget.left
        }
      },
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
            className: 'remove-link'
            onMouseDown: @removeLink
          },
            RemoveIcon {}
        button {
          className: 'add-link'
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
          spellCheck: true
          onChange: @onChange
          handlePastedText: @onPaste
        }
      div { className: 'draft-caption__actions'},
        button {
          onMouseDown: @onStyleChange
          className: 'italic'
        }, 'I'
        button {
          onMouseDown: @promptForLink
          className: 'link'
        },
          LinkIcon {}
      @printUrlInput()
