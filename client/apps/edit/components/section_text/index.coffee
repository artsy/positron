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
  KeyBindingUtil,
  getDefaultKeyBinding,
  DefaultDraftBlockRenderMap,
  getVisibleSelectionRect } = require 'draft-js'
{ convertFromHTML, convertToHTML } = require 'draft-convert'
Immutable = require 'immutable'
Decorators = require '../../../../components/rich_text/decorators.coffee'
icons = -> require('../../../../components/rich_text/icons.jade') arguments...
{ div, nav, a, button, span, p, br, h3 } = React.DOM
ButtonStyle = React.createFactory require '../../../../components/rich_text/components/button_style.coffee'
InputUrl = React.createFactory require '../../../../components/rich_text/components/input_url.coffee'
editor = (props) -> React.createElement Editor, props
Channel = require '../../../../models/channel.coffee'

INLINE_STYLES = [
  {label: 'B', style: 'BOLD'}
  {label: 'I', style: 'ITALIC'}
  {label: ' S ', style: 'STRIKETHROUGH'}
]

BLOCK_TYPES = [
  {label: 'H2', style: 'header-two'}
  {label: 'H3', style: 'header-three'}
  {label: 'UL', style: 'unordered-list-item'}
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
    strategy: Decorators.findLinkEntities
    component: Decorators.Link
  }
]

module.exports = React.createClass
  displayName: 'SectionText'

  getInitialState: ->
    editorState: EditorState.createEmpty(new CompositeDecorator(decorators))
    focus: false unless @props.editing
    html: null
    selectionTarget: null
    showUrlInput: false
    pluginType: null
    urlValue: null
    showMenu: false

  componentWillMount: ->
    @channel = new Channel sd.CURRENT_CHANNEL

  componentDidMount: ->
    if @props.section.get('body')?.length
      blocksFromHTML = @convertFromHTML(@props.section.get('body'))
      @setState
        html: @props.section.get('body')
        editorState: EditorState.createWithContent(blocksFromHTML, new CompositeDecorator(decorators))

  componentWillReceiveProps: (nextProps) ->
    if !@props.editing and nextProps.editing
      @focus()

  onChange: (editorState) ->
    @checkSelection()
    html = @convertToHtml editorState
    @setState editorState: editorState, html: html
    @props.section.set('body', html)

  onClickOff: ->
    @props.section.destroy() if $(@props.section.get('body')).text() is ''

  focus: (e) ->
    @setState focus: true
    @refs.editor.focus()

  onBlur: ->
    @setState focus: false

  convertFromHTML: (html) ->
    blocksFromHTML = convertFromHTML({
      htmlToStyle: (nodeName, node, currentStyle) ->
        if nodeName is 'span' and node.style.textDecoration is 'line-through'
          return currentStyle.add 'STRIKETHROUGH'
        else
          return currentStyle
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
          sanitizeName = originalText.split(' ')[0].replace(/[.,\/#!$%\^&\*;:{}=\_`’'~()]/g,"")
          name = if entity.data.name then ' name="' + sanitizeName + '"' else ''
          if entity.data.className?.includes('is-follow-link')
            artist = entity.data.url.split('/artist/')[1]
            return '<a href="' + entity.data.url + '" class="' + entity.data.className + '"' + name + '>' + originalText + '</a><a data-id="'+ artist + '" class="entity-follow artist-follow"></a>'
          else if entity.data.className is 'is-jump-link'
            return a { name: sanitizeName, className: entity.data.className}
          else
            return a { href: entity.data.url}
        return originalText
      blockToHTML: (block) ->
        if block.type is 'header-three'
          return h3 {}, block.text
      styleToHTML: (style) ->
        if style is 'STRIKETHROUGH'
          return span { style: {textDecoration: 'line-through'}}
    })(editorState.getCurrentContent())
    # put the line breaks back for correct client rendering
    html = html
      .replace /<p><\/\p>/g, '<p><br></p>'
      .replace /<p> <\/\p>/g, '<p><br></p>'
      .replace(/  /g, ' &nbsp;')
    return html

  stripGoogleStyles: (html) ->
    # remove non-breaking spaces between paragraphs
    html = html.replace(/<\/\p><br>/g, '</p>').replace('<br class="Apple-interchange-newline">', '')
    doc = document.createElement('div')
    doc.innerHTML = html
    # remove dummy b tags google docs wraps document in
    boldBlocks = doc.getElementsByTagName('B')
    for block, i in boldBlocks
      if block.style.fontWeight is 'normal'
        $(doc.getElementsByTagName('B')[i]).replaceWith(doc.getElementsByTagName('B')[i].innerHTML)
    # replace bold and italic spans with actual b or em tags
    spans = doc.getElementsByTagName('SPAN')
    for span, i in spans
      newSpan = span
      if span?.style.fontStyle is 'italic' and span?.style.fontWeight is '700'
        newSpan = '<span><strong><em>' + span.innerHTML + '</em></strong></span>'
      else if span?.style.fontStyle is 'italic'
        newSpan = '<span><em>' + span.innerHTML + '</em></span>'
      else if span?.style.fontWeight is '700'
        newSpan = '<span><strong>' + span.innerHTML + '</strong></span>'
      $(doc.getElementsByTagName('SPAN')[i]).replaceWith(newSpan)
    return doc.innerHTML

  makePlainText: () ->
    { editorState } = @state
    selection = editorState.getSelection()
    noLinks = RichUtils.toggleLink editorState, selection, null
    noBlocks = RichUtils.toggleBlockType noLinks, 'unstyled'
    noStyles = noBlocks.getCurrentContent().getBlocksAsArray().map (contentBlock) =>
      @stripCharacterStyles contentBlock
    newState = ContentState.createFromBlockArray noStyles
    if !selection.isCollapsed()
      @onChange EditorState.push(editorState, newState, null)

  stripCharacterStyles: (contentBlock, keepAllowed) ->
    characterList = contentBlock.getCharacterList().map (character) ->
      if keepAllowed
        unless character.hasStyle 'UNDERLINE'
          return character if character.hasStyle('BOLD') || character.hasStyle('ITALIC') || character.hasStyle('STRIKETHROUGH')
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
    switch e
      when 'header-two', 'header-three', 'ordered-list-item', 'unordered-list-item'
        @toggleBlockType e
      when 'custom-clear'
        @makePlainText()
      when 'italic', 'bold'
        return if @getSelectedBlock().content.get('type') is 'header-three'
        newState = RichUtils.handleKeyCommand @state.editorState, e
        @onChange newState if newState
      when 'link-prompt'
        className = @getExistingLinkData().className
        return @promptForLink() unless className
        if className.includes 'is-follow-link'
          @promptForLink 'artist'
        else if className.includes 'is-jump-link'
          @promptForLink 'toc'

  keyBindingFn: (e) ->
    if KeyBindingUtil.hasCommandModifier(e)
      if e.keyCode is 50   # command + 2
        return 'header-two'
      if e.keyCode is 51   # command + 3
        return 'header-three'
      if e.keyCode is 191  # command + /
        return 'custom-clear'
      if e.keyCode is 55   # command + 7
        return 'ordered-list-item'
      if e.keyCode is 56   # command + 8
        return 'unordered-list-item'
      if e.keyCode is 75   # command + K
        return 'link-prompt'
    return getDefaultKeyBinding(e)

  toggleBlockType: (blockType) ->
    @onChange RichUtils.toggleBlockType(@state.editorState, blockType)

  toggleInlineStyle: (inlineStyle) ->
    if @getSelectedBlock().content.get('type') is 'header-three'
      @stripCharacterStyles @getSelectedBlock().content
    else
      @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)

  promptForLink: (pluginType) ->
    selectionTarget = null
    unless window.getSelection().isCollapsed
      selectionTarget = @stickyControlsBox(25, 200)
      url = @getExistingLinkData().url
      @setState
        showUrlInput: true
        focus: false
        urlValue: url
        selectionTarget: selectionTarget
        pluginType: pluginType

  confirmLink: (urlValue, pluginType='', className='') ->
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
    @setState
      showUrlInput: false
      urlValue: ''
      selectionTarget: null
      pluginType: null
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
      className = linkInstance.getData().className || ''
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

  stickyControlsBox: (fromTop, fromLeft) ->
    location = @getSelectionLocation()
    top = location.target.top - location.parent.top + fromTop
    left = location.target.left - location.parent.left + (location.target.width / 2) - fromLeft
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
      else
        className = 'is-follow-link'
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

  checkSelection: () ->
    selectionTargetL = if @channel.hasFeature 'follow' then 125 else 100
    if !window.getSelection().isCollapsed
      @setState showMenu: true, selectionTarget: @stickyControlsBox(-93, selectionTargetL)
    else
      @setState showMenu: false

  render: ->
    isEditing = if @props.editing then ' is-editing' else ''
    hasPlugins = if @channel.hasFeature 'follow' then ' has-plugins' else ''

    div {
      className: 'edit-section-text' + isEditing
      onClick: @focus
    },
      if @state.showMenu
        nav {
          className: 'edit-section-text__menu' + hasPlugins
          style:
            top: @state.selectionTarget.top
            marginLeft: @state.selectionTarget.left
        },
          @printButtons(INLINE_STYLES, @toggleInlineStyle)
          @printButtons(BLOCK_TYPES, @toggleBlockType)
          @printButtons([{label: 'link', style: 'link'}], @promptForLink)
          @printButtons(@hasPlugins(), @setPluginType)
          @printButtons([{label: 'remove-formatting', style: 'remove-formatting'}], @makePlainText)
      div {
        className: 'edit-section-text__input'
        onMouseUp: @checkSelection
        onKeyUp: @checkSelection
      },
        editor {
          ref: 'editor'
          editorState: @state.editorState
          spellCheck: true
          onChange: @onChange
          decorators: decorators
          handleKeyCommand: @handleKeyCommand
          keyBindingFn: @keyBindingFn
          handlePastedText: @onPaste
          blockRenderMap: blockRenderMap
        }
        @printUrlInput()
