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
{ inlineStyles,
  blockTypes,
  blockRenderMap,
  decorators } = require './draft_config.coffee'
{ stripGoogleStyles, keyBindingFnFull } = require '../../../../components/rich_text/utils/index.coffee'

editor = (props) -> React.createElement Editor, props
{ div, nav, a, span, p, h3 } = React.DOM
ButtonStyle = React.createFactory require '../../../../components/rich_text/components/button_style.coffee'
InputUrl = React.createFactory require '../../../../components/rich_text/components/input_url.coffee'
Channel = require '../../../../models/channel.coffee'


module.exports = React.createClass
  displayName: 'SectionText'

  getInitialState: ->
    editorState: EditorState.createEmpty(new CompositeDecorator(decorators()))
    focus: false
    html: null
    selectionTarget: null
    showUrlInput: false
    pluginType: null
    urlValue: null
    showMenu: false

  componentWillMount: ->
    channel = new Channel sd.CURRENT_CHANNEL
    @hasFollow = channel.hasFeature 'follow'
    @hasToc = channel.hasFeature 'toc'
    @hasFeatures = @hasFollow or @hasToc

  componentDidMount: ->
    if @props.section.get('body')?.length
      blocksFromHTML = @convertFromHTML @props.section.get('body')
      @setState
        html: @props.section.get('body')
        editorState: EditorState.createWithContent(blocksFromHTML, new CompositeDecorator(decorators()))
    else if @props.editing
      @focus()

  onChange: (editorState) ->
    html = @convertToHtml editorState
    @setState editorState: editorState, html: html
    @props.section.set('body', html)

  onClickOff: -> #called from sectionContainer
    @setState focus: false, showMenu: false, showUrlInput: false
    @props.section.destroy() if $(@props.section.get('body')).text() is ''
    @refs.editor.blur()

  focus: ->
    @setState focus: true
    @refs.editor.focus()

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
    html = if html is '<p><br></p>' then '' else html
    return html

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
    html = stripGoogleStyles(html)
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

  toggleBlockType: (blockType) ->
    @onChange RichUtils.toggleBlockType(@state.editorState, blockType)
    @setState showMenu: false

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
        showMenu: false
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
      showMenu: false
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

  getPlugins: ->
    plugins = []
    plugins.push({label: 'artist', style: 'artist'}) if @hasFollow
    plugins.push({label: 'toc', style: 'toc'}) if @hasToc
    return plugins

  checkSelection: ->
    selectionTargetL = if @hasFeatures then 125 else 100
    if !window.getSelection().isCollapsed
      @setState showMenu: true, selectionTarget: @stickyControlsBox(-93, selectionTargetL)
    else
      @setState showMenu: false

  render: ->
    isEditing = if @props.editing then ' is-editing' else ''
    hasPlugins = if @hasFeatures then ' has-plugins' else ''

    div {
      className: 'edit-section-text' + isEditing
      onClick: @focus
    },
      if @state.showMenu
        nav {
          className: 'edit-section-text__menu rich-text--nav' + hasPlugins
          style:
            top: @state.selectionTarget?.top
            marginLeft: @state.selectionTarget?.left
        },
          @printButtons(inlineStyles(), @toggleInlineStyle)
          @printButtons(blockTypes(), @toggleBlockType)
          @printButtons([{label: 'link', style: 'link'}], @promptForLink)
          @printButtons(@getPlugins(), @setPluginType)
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
          keyBindingFn: keyBindingFnFull
          handlePastedText: @onPaste
          blockRenderMap: blockRenderMap()
        }
        if @props.editing and @state.showUrlInput
          InputUrl {
            removeLink: @removeLink
            confirmLink: @confirmLink
            selectionTarget: @state.selectionTarget
            pluginType: @state.pluginType
            urlValue: @state.urlValue
          }