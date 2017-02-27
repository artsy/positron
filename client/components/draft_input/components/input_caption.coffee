React = require 'react'
window.global = window
sd = require('sharify').data
window.process = {env: {NODE_ENV: sd.NODE_ENV}}

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

InputUrl = React.createFactory require './input_url.coffee'
DraftDecorators = require '../decorators.coffee'
icons = -> require('../icons.jade') arguments...
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

  convertToHtml: (editorState) ->
    html = stateToHTML editorState.getCurrentContent()
    debugger
    html = html.replace(/(\r\n|\n|\r)/gm,'').replace(/<\/p><p>/g, ' ')
    return html

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    html = convertFromHTML(html)
    convertedHtml = html.contentBlocks.map (contentBlock) =>
      unstyled = @stripPastedStyles contentBlock
      unless unstyled.getType() in ['unstyled','LINK']
        unstyled = unstyled.set('type', 'unstyled')
      return unstyled
    blockMap = ContentState.createFromBlockArray(convertedHtml, html.entityMap).blockMap
    Modifier.removeInlineStyle(editorState.getCurrentContent(), editorState.getSelection(), 'font-weight')
    newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap)
    this.onChange(EditorState.push(editorState, newState, 'insert-fragment'))
    return true

  stripPastedStyles: (contentBlock) ->
    characterList = contentBlock.getCharacterList().map (character) ->
      if character.get('style') isnt 'ITALIC'
        character.set('style', character.get('style').clear())
    unstyled = contentBlock.set('characterList', characterList)
    return unstyled

  promptForLink: (e) ->
    { editorState } = @state
    e.preventDefault()
    selection = editorState.getSelection()
    selectionTarget = {top: 0, left: 0}
    url = ''
    if !selection.isCollapsed()
      selectionTarget = @stickyLinkBox()
      contentState = editorState.getCurrentContent()
      startKey = selection.getStartKey()
      startOffset = selection.getStartOffset()
      blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
      linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)
      if linkKey
        linkInstance = contentState.getEntity(linkKey)
        url = linkInstance.getData().url
    @setState({showUrlInput: true, urlValue: url, selectionTarget: selectionTarget})

  getSelectionLocation: ->
    target = getVisibleSelectionRect(window)
    parent = {
      top: $('.draft-caption__input').offset().top - window.pageYOffset
      left: $('.draft-caption__input').offset().left
    }
    return {target: target, parent: parent}

  stickyLinkBox: ->
    location = @getSelectionLocation()
    top = location.target.top - location.parent.top + 25
    left = location.target.left - location.parent.left - (location.target.width / 2) - 135
    return {top: top, left: left}

  confirmLink: (urlValue) ->
    { editorState } = @state
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

  handleReturn: (e) ->
    e.preventDefault()
    return true

  handleKeyCommand: (e) ->
    if e is 'italic'
      newState = RichUtils.handleKeyCommand @state.editorState, e
      if newState
        @onChange newState
        return true
    return false

  printUrlInput: ->
    if @state.showUrlInput
      InputUrl {
        selectionTarget: @state.selectionTarget
        removeLink: @removeLink
        confirmLink: @confirmLink
        urlValue: @state.urlValue
      }

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
          handleReturn: @handleReturn
          handleKeyCommand: @handleKeyCommand
        }
      div { className: 'draft-caption__actions'},
        button {
          onMouseDown: @onStyleChange
          className: 'italic'
        }, 'I'
        button {
          onMouseDown: @promptForLink
          className: 'link'
          dangerouslySetInnerHTML: __html: $(icons()).filter('.link').html()
        }
      @printUrlInput()
