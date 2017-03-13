React = require 'react'
ReactDOM = require 'react-dom'
window.global = window
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
  DefaultDraftBlockRenderMap,
  getVisibleSelectionRect } = require 'draft-js'
{ convertFromHTML, convertToHTML } = require 'draft-convert'
Immutable = require 'immutable'
DraftDecorators = require '../decorators.coffee'
icons = -> require('../icons.jade') arguments...
{ div, nav, a, button, span, p, br } = React.DOM
ButtonStyle = React.createFactory require './button_style.coffee'
InputUrl = React.createFactory require './input_url.coffee'
editor = (props) -> React.createElement Editor, props
Channel = require '../../../models/channel.coffee'

INLINE_STYLES = [
  {label: 'B', style: 'BOLD'}
  {label: 'I', style: 'ITALIC'}
  {label: ' S ', style: 'STRIKETHROUGH'}
]

BLOCK_TYPES = [
  {label: 'H2', style: 'header-two'}
  {label: 'H3', style: 'header-three'}
  {label: 'UL', style: 'unordered-list-item'}
  {label: 'OL', style: 'ordered-list-item'}
]

blockRenderMap = Immutable.Map({
  'header-two': {
    element: 'h2'
  },
  'header-three': {
    element: 'h3'
  },
  'unordered-list-item': {
    element: 'li'
  },
  'ordered-list-item': {
    element: 'li'
  },
  'unstyled': {
    element: 'div'
    aliasedElements: ['p']
    className: 'unstyled'
  }
})

decorators = [
  {
    strategy: DraftDecorators.findLinkEntities
    component: DraftDecorators.Link
  }
]

module.exports = React.createClass
  displayName: 'DraftInputText'

  getInitialState: ->
    editorState: EditorState.createEmpty(new CompositeDecorator(decorators))
    focus: false
    html: null
    selectionTarget: null
    showUrlInput: false
    pluginType: null
    urlValue: null

  componentWillMount: ->
    @channel = new Channel sd.CURRENT_CHANNEL

  componentDidMount: ->
    if @props.section.get('body')?.length
      blocksFromHTML = @convertFromHTML(@props.section.get('body'))
      @setState editorState: EditorState.createWithContent(blocksFromHTML, new CompositeDecorator(decorators))

  componentWillReceiveProps: (nextProps) ->
    if @props.editing and !nextProps.editing
      @setState focus: false, showUrlInput: false, urlValue: null
    else
      @focus() if @props.editing

  onChange: (editorState) ->
    html = @convertToHtml editorState
    @setState editorState: editorState, html: html
    @props.section.set('body', html)

  onClickOff: ->
    @props.section.destroy() if $(@props.section.get('body')).text() is ''

  logState: ->
    content = convertToRaw(@state.editorState.getCurrentContent())
    console.log(JSON.stringify(content))

  focus: (e) ->
    @setState focus: true
    @refs.editor.focus()

  onBlur: ->
    @setState focus: false

  convertFromHTML: (html) ->
    blocksFromHTML = convertFromHTML({
      htmlToEntity: (nodeName, node) ->
        if nodeName is 'a'
          data = {url: node.href, name: node.name, className: node.classList.toString()}
          return Entity.create(
              'LINK',
              'MUTABLE',
              data
          )
        if nodeName is 'p' and node.innerHTML is '<br>'
          node.innerHTML = '' # remove <br>, it renders extra breaks in editor
      })(html)
    return blocksFromHTML

  convertToHtml: (editorState) ->
    html = convertToHTML({
      entityToHTML: (entity, originalText) ->
        if entity.type is 'LINK'
          className = if entity.data.className then ' class="' + entity.data.className + '"' else ''
          name = if entity.data.name then ' name="' + originalText + '"' else ''
          url = if entity.data.url then ' href="' + entity.data.url + '"' else ''
          followButton = if entity.data.className is 'is-follow-link' then '<a class="entity-follow artist-follow"></a>' else ''
          return '<a' + url + className + name + '>' + originalText + '</a>' + followButton
        return originalText
      styleToHTML: (style) ->
        if style is 'STRIKETHROUGH'
          return span { style: {textDecoration: 'line-through'}}
    })(editorState.getCurrentContent())
    # put the line breaks back for correct client rendering
    html = html.replace("<p></p>", "<p><br></p>").replace("<p> </p>", "<p><br></p>")
    return html

  stripGoogleStyles: (html) ->
    # remove non-breaking spaces between paragraphs
    html = html.replace(/<\/p\>\<br\>/g, "</p>")
    tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    # remove dummy b tags google docs wraps document in
    boldBlocks = tempDiv.getElementsByTagName("B")
    for block, i in boldBlocks
      if block.style.fontWeight is 'normal'
        $(tempDiv.getElementsByTagName("B")[i]).replaceWith(tempDiv.getElementsByTagName("B")[i].innerHTML)
    # replace bold spans with actual b tags
    boldSpans = tempDiv.getElementsByTagName("SPAN")
    for span, i in boldSpans
      if span?.style.fontWeight is '700'
        newSpan = '<strong>' + span.innerHTML + '</strong>'
        $(tempDiv.getElementsByTagName("SPAN")[i]).replaceWith(newSpan)
    return tempDiv.innerHTML

  makePlainText: () ->
    { editorState } = @state
    selection = editorState.getSelection()
    noLinks = RichUtils.toggleLink editorState, selection, null
    noBlocks = RichUtils.toggleBlockType noLinks, 'unstyled'
    noStyles = noBlocks.getCurrentContent().getBlocksAsArray().map (contentBlock) =>
      @stripCharacterStyles contentBlock
    newState = ContentState.createFromBlockArray noStyles
    if !selection.isCollapsed()
      @setState({
        editorState: EditorState.push(editorState, newState, null)
      })

  stripCharacterStyles: (contentBlock, keepAllowed) ->
    characterList = contentBlock.getCharacterList().map (character) ->
      unless character.hasStyle 'UNDERLINE'
        return character if keepAllowed and character.hasStyle 'BOLD' or character.hasStyle 'ITALIC' or character.hasStyle 'STRIKETHROUGH'
      character.set 'style', character.get('style').clear()
    unstyled = contentBlock.set 'characterList', characterList
    return unstyled

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    html = @stripGoogleStyles(html)
    blocksFromHTML = @convertFromHTML html
    convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
      unstyled = @stripCharacterStyles contentBlock, true
      unless unstyled.getType() in ['unstyled', 'LINK', 'header-two', 'header-three', 'unordered-list-item', 'ordered-list-item']
        unstyled = unstyled.set 'type', 'unstyled'
      return unstyled
    blockMap = ContentState.createFromBlockArray(convertedHtml, blocksFromHTML.entityMap).blockMap
    newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap)
    this.onChange(EditorState.push(editorState, newState, 'insert-fragment'))
    return true

  handleKeyCommand: (e) ->
    if e in ['italic', 'bold']
      newState = RichUtils.handleKeyCommand @state.editorState, e
      if newState
        @onChange newState
        return true
    return false

  toggleBlockType: (blockType) ->
    @onChange RichUtils.toggleBlockType(@state.editorState, blockType)

  toggleInlineStyle: (inlineStyle) ->
    unless @getSelectedBlock().content.get('type') is 'header-three'
      @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)

  promptForLink: (pluginType) ->
    { editorState } = @state
    selectionTarget = null
    if !editorState.getSelection().isCollapsed()
      selectionTarget = @stickyLinkBox()
      url = @getExistingLinkData().url
      @setState({showUrlInput: true, focus: false, urlValue: url, selectionTarget: selectionTarget})

  confirmLink: (urlValue, pluginType='', className) ->
    { editorState } = @state
    contentState = editorState.getCurrentContent()
    props = @setPluginProps urlValue, pluginType, className
    contentStateWithEntity = contentState.createEntity(
      'LINK'
      'MUTABLE'
      props
    )
    entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    newEditorState = EditorState.set editorState, { currentContent: contentStateWithEntity }
    @setState({
      showUrlInput: false
      urlValue: ''
      selectionTarget: null
      pluginType: null
    })
    @onChange RichUtils.toggleLink(
        newEditorState
        newEditorState.getSelection()
        entityKey
      )

  removeLink: (e) ->
    e?.preventDefault()
    { editorState } = @state
    selection = editorState.getSelection()
    if !selection.isCollapsed()
      @setState({
        showUrlInput: false
        urlValue: ''
        editorState: RichUtils.toggleLink(editorState, selection, null)
      })

  getExistingLinkData: ->
    url = ''
    key = @getSelectedBlock().key
    if key
      linkInstance = @state.editorState.getCurrentContent().getEntity(key)
      url = linkInstance.getData().url
      className = linkInstance.getData().className
    return {url: url, key: key, className: className}

  getSelectedBlock: ->
    { editorState } = @state
    selection = editorState.getSelection()
    contentState = editorState.getCurrentContent()
    startKey = selection.getStartKey()
    startOffset = selection.getStartOffset()
    closestBlock = contentState.getBlockForKey(startKey)
    blockKey = closestBlock.getEntityAt(startOffset)
    return {key: blockKey, content: closestBlock}

  getSelectionLocation: ->
    target = getVisibleSelectionRect(window)
    $parent = $(ReactDOM.findDOMNode(@refs.editor)).offset()
    parent = {
      top: $parent.top - window.pageYOffset
      left: $parent.left
    }
    return {target: target, parent: parent}

  stickyLinkBox: ->
    location = @getSelectionLocation()
    top = location.target.top - location.parent.top + 25
    left = location.target.left - location.parent.left + (location.target.width / 2) - 200
    return {top: top, left: left}

  setPluginType: (e) ->
    @setState pluginType: e
    if e is 'artist'
      @promptForLink e
    if e is 'toc'
      url = @getExistingLinkData().url
      className = @getExistingLinkData().className || ''
      if className is 'is-jump-link'
        @removeLink()
      else
        @confirmLink url, e, className

  setPluginProps: (urlValue, pluginType, className) ->
    if pluginType is 'artist'
      className = @getExistingLinkData().className
      if className?.includes 'is-jump-link'
        name = 'toc'
        className = 'is-follow-link is-jump-link'
      props = { url: urlValue, className: className, name: name }
    else if pluginType is 'toc'
      name = 'toc'
      if className.includes('is-follow-link') and className.includes('is-jump-link')
        # remove toc but keep existing link
        name = ''
        className = 'is-follow-link'
      else if className.includes 'is-follow-link'
        # add toc to existing artist link
        className = 'is-follow-link is-jump-link'
      else
        # a plain toc link with no href
        className = 'is-jump-link'
      props = { url: urlValue, className: className, name: name  }
    else
      props = { url: urlValue }
    return props

  printButtons: (buttons, handleToggle) ->
    buttons.map (type, i) ->
      ButtonStyle {
        key: i
        label: type.label
        name: type.style
        onToggle: handleToggle
      }

  hasPlugins: ->
    plugins = []
    plugins.push({label: 'artist', style: 'artist'}) if @channel.hasFeature 'follow'
    plugins.push({label: 'toc', style: 'toc'}) if @channel.hasFeature 'toc'
    return plugins

  printUrlInput: ->
    if @props.editing and @state.showUrlInput
      InputUrl {
        removeLink: @removeLink
        confirmLink: @confirmLink
        onClick: @blur
        selectionTarget: @state.selectionTarget
        pluginType: @state.pluginType
        urlValue: @state.urlValue
      }

  render: ->
    isEditing = if @props.editing then ' is-editing' else ''
    isReadOnly = if @props.editing and @state.showUrlInput then true else false

    div {
      className: 'draft-text' + isEditing
    },
      if @props.editing
        nav {
          className: 'draft-text__menu edit-section-controls'
        },
          @printButtons(INLINE_STYLES, @toggleInlineStyle)
          @printButtons(BLOCK_TYPES, @toggleBlockType)
          @printButtons([{label: 'link', style: 'link'}], @promptForLink)
          @printButtons(@hasPlugins(), @setPluginType)
          @printButtons([{label: 'remove-formatting', style: 'remove-formatting'}], @makePlainText)
      div {
        className: 'draft-text__input'
        onClick: @focus
      },
        editor {
          ref: 'editor'
          editorState: @state.editorState
          spellCheck: true
          onChange: @onChange
          readOnly: isReadOnly
          decorators: decorators
          handleKeyCommand: @handleKeyCommand
          handlePastedText: @onPaste
          blockRenderMap: blockRenderMap
        }
        @printUrlInput()
