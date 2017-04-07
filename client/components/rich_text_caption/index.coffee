React = require 'react'
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
Decorators = require '../rich_text/decorators.coffee'
icons = -> require('../rich_text/icons.jade') arguments...
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
    @setState focus: false

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
      top: $('.rich-text--caption__input').offset().top - window.pageYOffset
      left: $('.rich-text--caption__input').offset().left
    }
    return {target: target, parent: parent}

  stickyLinkBox: ->
    location = @getSelectionLocation()
    top = location.target.top - location.parent.top + 25
    left = location.target.left - location.parent.left + (location.target.width / 2) - 200
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

    div { className: 'rich-text--caption' },
      div {
        className: 'rich-text--caption__input bordered-input' + hasFocus
        onClick: @focus
        onBlur: @onBlur
      },
        editor {
          ref: 'editor'
          placeholder: 'Media caption'
          editorState: @state.editorState
          spellCheck: true
          onChange: @onChange
          handlePastedText: @onPaste
          handleReturn: @handleReturn
          handleKeyCommand: @handleKeyCommand
        }
      div { className: 'rich-text--caption__actions'},
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
