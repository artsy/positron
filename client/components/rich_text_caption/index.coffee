React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
window.process = {env: {NODE_ENV: sd.NODE_ENV}}
{ convertToRaw,
  CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  Entity,
  RichUtils,
  Modifier,
  getVisibleSelectionRect } = require 'draft-js'
{ convertToHTML, convertFromHTML } = require 'draft-convert'
InputUrl = React.createFactory require '../rich_text/components/input_url.coffee'
Decorators = require '../rich_text/utils/decorators.coffee'
{ keyBindingFnCaption }  = require '../rich_text/utils/index.coffee'
icons = -> require('../rich_text/utils/icons.jade') arguments...
{ div, button, p, a, input } = React.DOM
editor = (props) -> React.createElement Editor, props

decorator = new CompositeDecorator([
    {
      strategy: Decorators.findLinkEntities
      component: Decorators.Link
    }
  ])

module.exports = React.createClass
  displayName: 'RichTextCaption'

  getInitialState: ->
    editorState: EditorState.createEmpty(decorator)
    showUrlInput: false
    urlValue: ''
    html: null
    focus: false
    selectionTarget: null
    showMenu: false

  componentDidMount: ->
    if @props.item.caption?.length
      blocksFromHTML = @convertFromHTML(@props.item.caption)
      @setState
        html: @props.item.caption
        editorState: EditorState.createWithContent(blocksFromHTML, decorator)

  onChange: (editorState) ->
    html = @convertToHtml editorState
    @setState editorState: editorState, html: html
    if @props.onChange
      @props.onChange(html)
    else
      @props.item.caption = html

  focus: ->
    @setState focus: true
    @refs.editor.focus()

  onBlur: ->
    @setState
      focus: false
      showMenu: false

  onStyleChange: (e) ->
    e.preventDefault()
    @onChange RichUtils.toggleInlineStyle(@state.editorState, e.target.className.toUpperCase())

  convertFromHTML: (html) ->
    blocksFromHTML = convertFromHTML({
      htmlToEntity: (nodeName, node) ->
        if nodeName is 'a'
          data = {url: node.href}
          return Entity.create(
            'LINK',
            'MUTABLE',
            data
          )
      })(html)
    return blocksFromHTML

  convertToHtml: (editorState) ->
    html = convertToHTML({
      entityToHTML: (entity, originalText) ->
        if entity.type is 'LINK'
          return a { href: entity.data.url}
        return originalText
    })(editorState.getCurrentContent())
    html = html
      .replace /(\r\n|\n|\r)/gm, ''
      .replace /<\/p><p>/g, ' '
      .replace(/  /g, ' &nbsp;')
    html = if html is '<p></p>' then '' else html
    return html

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    blocksFromHTML = @convertFromHTML(html)
    convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
      unstyled = @stripPastedStyles contentBlock
      unless unstyled.getType() in ['unstyled','LINK']
        unstyled = unstyled.set('type', 'unstyled')
      return unstyled
    blockMap = ContentState.createFromBlockArray(convertedHtml, blocksFromHTML.entityMap).blockMap
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
    e.preventDefault() if e
    selection = editorState.getSelection()
    selectionTarget = {top: 0, left: 0}
    url = ''
    if !selection.isCollapsed()
      selectionTarget = @stickyControlsBox(25, 200)
      contentState = editorState.getCurrentContent()
      startKey = selection.getStartKey()
      startOffset = selection.getStartOffset()
      blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
      linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)
      if linkKey
        linkInstance = contentState.getEntity(linkKey)
        url = linkInstance.getData().url
    @setState
      showUrlInput: true
      showMenu: false
      urlValue: url
      selectionTarget: selectionTarget

  getSelectionLocation: ->
    selection = window.getSelection().getRangeAt(0).getClientRects()
    if selection[0].width is 0
      target = selection[1]
    else
      target = selection[0]
    $parent = $(ReactDOM.findDOMNode(@refs.editor)).offset()
    parent = {
      top: $parent.top - window.pageYOffset
      left: $parent.left
    }
    return {target: target, parent: parent}

  stickyControlsBox: (fromTop, fromLeft) ->
    location = @getSelectionLocation()
    top = location.target.top - location.parent.top + fromTop
    left = location.target.left - location.parent.left + (location.target.width / 2) - fromLeft
    return {top: top, left: left}

  checkSelection: ->
    if !window.getSelection().isCollapsed
      @setState showMenu: true, selectionTarget: @stickyControlsBox(-50, 45)
    else
      @setState showMenu: false

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
      showMenu: false
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
      return @onChange newState if newState
    if e is 'link-prompt'
      return @promptForLink()
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
    div { className: 'rich-text--caption' },
      div {
        className: 'rich-text--caption__input'
        onClick: @focus
        onBlur: @onBlur
        onMouseUp: @checkSelection
        onKeyUp: @checkSelection
      },
        editor {
          ref: 'editor'
          placeholder: @props.placeholder or 'Media caption'
          editorState: @state.editorState
          spellCheck: true
          readOnly: !@props.editing or false
          onChange: @onChange
          handlePastedText: @onPaste
          handleReturn: @handleReturn
          handleKeyCommand: @handleKeyCommand
          keyBindingFn: keyBindingFnCaption
        }
      if @state.showMenu and @props.editing
        div {
          className: 'rich-text--caption__actions rich-text--nav'
          style:
            top: @state.selectionTarget?.top
            marginLeft: @state.selectionTarget?.left
        },
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
