React = require 'react'
ReactDOM = require 'react-dom'
window.global = window
window.process = {env: {NODE_ENV: 'development'}}
_s = require 'underscore.string'

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
DraftDecorators = require '../decorators.coffee'
icons = -> require('../icons.jade') arguments...
{ div, nav, a, button } = React.DOM
ButtonStyle = React.createFactory require './button_style.coffee'
InputUrl = React.createFactory require './input_url.coffee'
editor = (props) -> React.createElement Editor, props
Channel = require '../../../models/channel.coffee'

INLINE_STYLES = [
  {label: 'B', style: 'BOLD'}
  {label: 'I', style: 'ITALIC'}
]

BLOCK_TYPES = [
  {label: 'H2', style: 'header-two'}
  {label: 'H3', style: 'header-three'}
  {label: 'UL', style: 'unordered-list-item'}
  {label: 'OL', style: 'ordered-list-item'}
]

decorator = new CompositeDecorator([
    {
      strategy: DraftDecorators.findLinkEntities
      component: DraftDecorators.Link
    }
  ])

module.exports = React.createClass
  displayName: 'DraftInputText'

  getInitialState: ->
    editorState: EditorState.createEmpty()
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
      blocksFromHTML = convertFromHTML({ htmlToEntity: (nodeName, node) ->
        if nodeName is 'a'
          # here make jump-links immutable
          data = {url: node.href, name: node.name, className: node.classList.toString()}
          return Entity.create(
              'LINK',
              'MUTABLE',
              data
          )
        })(@props.section.get('body'))
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
    @logState()

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

  handleKeyCommand: (e) ->
    if e in ['italic', 'bold']
      newState = RichUtils.handleKeyCommand @state.editorState, e
      if newState
        @onChange newState
        return true
    return false

  convertToHtml: (editorState) ->
    html = convertToHTML({ entityToHTML: (entity, originalText) ->
      if entity.type is 'LINK'
        className = if entity.data.className then ' class="' + entity.data.className + '"' else ''
        name = if entity.data.name then ' name="' + originalText + '"' else ''
        url = if entity.data.url then ' href="' + entity.data.url + '"' else ''
        followButton = if entity.data.className is 'is-follow-link' then '<a class="entity-follow artist-follow"></a>' else ''
        return '<a' + url + className + name + '>' + originalText + '</a>' + followButton
      return originalText
    })(editorState.getCurrentContent())
    return html

  makePlainText: () ->
    { editorState } = @state
    selection = editorState.getSelection()
    noLinks = RichUtils.toggleLink(editorState, selection, null)
    noBlocks = RichUtils.toggleBlockType(noLinks, 'unstyled')
    noStyles = noBlocks.getCurrentContent().getBlocksAsArray().map (contentBlock) =>
      @stripCharacterStyles contentBlock
    newState = ContentState.createFromBlockArray(noStyles)
    if !selection.isCollapsed()
      @setState({
        showUrlInput: false
        urlValue: ''
        editorState: EditorState.push(editorState, newState, null)
      })

  stripCharacterStyles: (contentBlock, keepAllowed) ->
    characterList = contentBlock.getCharacterList().map (character) ->
      unless character.hasStyle('UNDERLINE')
        return character if keepAllowed and character.hasStyle('BOLD') or character.hasStyle('ITALIC')
      character.set('style', character.get('style').clear())
    unstyled = contentBlock.set('characterList', characterList)
    return unstyled

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    html = convertFromHTML(html)
    convertedHtml = html.getBlocksAsArray().map (contentBlock) =>
      unstyled = @stripCharacterStyles contentBlock, true
      unless unstyled.getType() in ['unstyled', 'LINK', 'header-two', 'header-three', 'unordered-list-item', 'ordered-list-item']
        unstyled = unstyled.set('type', 'unstyled')
      return unstyled
    blockMap = ContentState.createFromBlockArray(convertedHtml, html.entityMap).blockMap
    Modifier.removeInlineStyle(editorState.getCurrentContent(), editorState.getSelection(), 'font-weight')
    newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap)
    this.onChange(EditorState.push(editorState, newState, 'insert-fragment'))
    return true

  toggleBlockType: (blockType) ->
    @onChange RichUtils.toggleBlockType(@state.editorState, blockType)

  toggleInlineStyle: (inlineStyle) ->
    @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)

  setPluginType: (e) ->
    @setState pluginType: e
    if e is 'artist'
      @promptForLink e
    if e is 'toc'
      @confirmLink '', e

  promptForLink: (pluginType) ->
    { editorState } = @state
    selection = editorState.getSelection()
    selectionTarget = null
    if !selection.isCollapsed()
      # selectionTarget = @stickyLinkBox getVisibleSelectionRect(window)
      contentState = editorState.getCurrentContent()
      startKey = selection.getStartKey()
      startOffset = selection.getStartOffset()
      blockWithLinkAtBeginning = contentState.getBlockForKey(startKey)
      linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset)
      url = ''
      if linkKey
        linkInstance = contentState.getEntity(linkKey)
        url = linkInstance.getData().url
      @setState({showUrlInput: true, focus: false, urlValue: url, selectionTarget: selectionTarget})

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
    left = location.target.left - location.parent.left + (location.target.width / 2) - 150
    return {top: top, left: left}

  confirmLink: (urlValue, pluginType) ->
    { editorState } = @state
    contentState = editorState.getCurrentContent()
    if pluginType is 'artist'
      props = { url: urlValue, className: 'is-follow-link', 'data-name': 'artist' }
    else if pluginType is 'toc'
      props = { url: urlValue, className: 'is-jump-link', name: 'toc'  }
    else
      props = { url: urlValue }
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
    e.preventDefault()
    { editorState } = @state
    selection = editorState.getSelection()
    if !selection.isCollapsed()
      @setState({
        showUrlInput: false
        urlValue: ''
        editorState: RichUtils.toggleLink(editorState, selection, null)
      })

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
          className: 'draft-text__menu'
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
        }
        @printUrlInput()
