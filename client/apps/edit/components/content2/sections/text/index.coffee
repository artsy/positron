React = require 'react'
ReactDOM = require 'react-dom'
_s = require 'underscore.string'
sd = require('sharify').data
window.process = {env: {NODE_ENV: sd.NODE_ENV}}
{ CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  getVisibleSelectionRect,
  RichUtils,
  Modifier,
  SelectionState } = require 'draft-js'
{ blockTypes,
  blockRenderMap,
  decorators,
  inlineStyles } = require './draft_config.coffee'
{ convertFromRichHtml,
  convertToRichHtml,
  getExistingLinkData,
  getSelectionDetails,
  getSelectionLocation,
  keyBindingFnFull,
  moveSelection,
  setSelectionToStart,
  stickyControlsBox,
  stripGoogleStyles } = require '../../../../../../components/rich_text/utils/index.coffee'
editor = (props) -> React.createElement Editor, props
{ div, nav, a, span, p, h3 } = React.DOM
EditNav = React.createFactory require '../../../../../../components/rich_text/components/edit_nav.coffee'
InputUrl = React.createFactory require '../../../../../../components/rich_text/components/input_url.coffee'
Channel = require '../../../../../../models/channel.coffee'


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
    hasFeatures: @props.channel.hasFeature 'follow'

  componentDidMount: ->
    if @props.section.get('body')?.length
      blocksFromHTML = convertFromRichHtml @props.section.get('body')
      editorState = EditorState.createWithContent(blocksFromHTML, new CompositeDecorator(decorators()))
      editorState = setSelectionToStart(editorState) if @props.editing
      @setState
        html: @props.section.get('body')
        editorState: editorState
    else if @props.editing
      @focus()

  componentDidUpdate: (prevProps) ->
    if @props.editing and @props.editing != prevProps.editing
      @focus()
    else if !@props.editing and @props.editing != prevProps.editing
      @refs.editor.blur()

  onChange: (editorState) ->
    html = convertToRichHtml editorState
    @setState editorState: editorState, html: html
    @props.section.set('body', html)

  onClickOff: -> #called from sectionContainer
    @setState focus: false, showMenu: false, showUrlInput: false
    @props.section.destroy() if @props.section.get('body') is ''
    @refs.editor.blur()

  focus: ->
    @setState focus: true
    @refs.editor.focus()

  handleReturn: (e) ->
    selection = getSelectionDetails(@state.editorState)
    # dont split from the first block, to avoid creating empty blocks
    # dont split from the middle of a paragraph
    if selection.isFirstBlock or selection.anchorOffset
      return 'not-handled'
    else
      e.preventDefault()
      @splitSection(selection.anchorKey)
      return 'handled'

  handleTab: (e) ->
    e.preventDefault()
    index = @props.index + 1
    if e.shiftKey
      index = @props.index - 1
    @props.onSetEditing index

  handleBackspace: (e) ->
    selection = getSelectionDetails(@state.editorState)
    # only merge a section if cursor is in first character of first block
    if selection.isFirstBlock and selection.anchorOffset is 0 and
     @props.sections.models[@props.index - 1].get('type') is 'text'
      mergeIntoHTML = @props.sections.models[@props.index - 1].get('body')
      @props.sections.models[@props.index - 1].destroy()
      newHTML = mergeIntoHTML + @state.html
      blocksFromHTML = convertFromRichHtml newHTML
      newSectionState = EditorState.push(@state.editorState, blocksFromHTML, null)
      newSectionState = setSelectionToStart newSectionState
      @onChange newSectionState
      @props.onSetEditing @props.index - 1

  handleChangeSection: (e) ->
    direction = 0
    direction =  -1 if e.key in ['ArrowUp', 'ArrowLeft']
    direction =  1 if e.key in ['ArrowDown', 'ArrowRight']
    selection = getSelectionDetails @state.editorState
    # if cursor is arrowing forward from last charachter of last block,
    # or cursor is arrowing back from first character of first block,
    # jump to adjacent section
    if selection.isLastBlock and selection.isLastCharacter and direction is 1 or
     selection.isFirstBlock and selection.isFirstCharacter and direction is -1
      @props.onSetEditing @props.index + direction
    else if e.key in ['ArrowLeft', 'ArrowRight']
      # manually move cursor to make up for draft's missing l/r arrow fallbacks
      newEditorState = moveSelection @state.editorState, selection, direction
      @onChange(newEditorState)
    else
      return true

  splitSection: (anchorKey) ->
    { editorState } = @state
    blockArray = editorState.getCurrentContent().getBlocksAsArray()
    for block, i in blockArray
      if block?.getKey() is anchorKey
        currentBlockArray = blockArray.splice(0, i)
        newBlockArray = blockArray
    if currentBlockArray
      currentContent = ContentState.createFromBlockArray currentBlockArray
      currentState = EditorState.push(editorState, currentContent, 'remove-range')
      newSectionContent = ContentState.createFromBlockArray newBlockArray
      newSectionState = EditorState.push(editorState, newSectionContent, null)
      newSectionHtml = convertToRichHtml(newSectionState)
      @onChange currentState
      @props.sections.add {type: 'text', body: newSectionHtml}, {at: @props.index + 1}
      return 'handled'

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    html = stripGoogleStyles(html)
    blocksFromHTML = convertFromRichHtml html
    convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
      unstyled = @stripCharacterStyles contentBlock, true
      unless unstyled.getType() in @availableBlocks() or unstyled.getType() is 'LINK'
        unstyled = unstyled.set 'type', 'unstyled'
      return unstyled
    blockMap = ContentState.createFromBlockArray(convertedHtml, blocksFromHTML.getBlocksAsArray()).blockMap
    newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap)
    @onChange EditorState.push(editorState, newState, 'insert-fragment')
    return true

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
          return character if character.hasStyle('BOLD') or character.hasStyle('ITALIC') or character.hasStyle('STRIKETHROUGH')
      character.set 'style', character.get('style').clear()
    unstyled = contentBlock.set 'characterList', characterList
    return unstyled

  availableBlocks: ->
    blockMap = blockRenderMap(@props.article.get('layout'))
    available = Object.keys(blockMap.toObject())
    return Array.from(available)

  handleKeyCommand: (e) ->
    if e.key
      @handleChangeSection e
    else if e in @availableBlocks()
      @toggleBlockType e
    else if e is 'custom-clear'
      @makePlainText()
    else if e is 'backspace'
      @handleBackspace e
    else if e in ['italic', 'bold']
      if @props.article.get('layout') is 'classic' and
       getSelectionDetails(@state.editorState).anchorType is 'header-three'
        return
      newState = RichUtils.handleKeyCommand @state.editorState, e
      @onChange newState if newState
    else if e is 'link-prompt'
      className = getExistingLinkData(@state.editorState).className
      return @promptForLink() unless className
      if className.includes 'is-follow-link'
        @promptForLink 'artist'

  toggleBlockQuote: ->
    currentHtml = @props.section.get('body')
    beforeBlock = _s(currentHtml).strLeft('<blockquote>')._wrapped
    afterBlock = _s(currentHtml).strRight('</blockquote>')._wrapped
    blockquote = currentHtml.replace(beforeBlock, '').replace(afterBlock, '')
    @props.sections.add {type: 'text', body: afterBlock}, {at: @props.index + 1}
    @props.sections.add {type: 'text', body: beforeBlock}, {at: @props.index }
    @props.section.set('body', blockquote)
    @props.onSetEditing @props.index + 1

  toggleBlockType: (blockType) ->
    @onChange RichUtils.toggleBlockType(@state.editorState, blockType)
    @setState showMenu: false
    if blockType is 'blockquote'
      @toggleBlockQuote()
    return 'handled'

  toggleInlineStyle: (inlineStyle) ->
    selection = getSelectionDetails(@state.editorState)
    if selection.anchorType is 'header-three' and @props.article.get('layout') is 'classic'
      @stripCharacterStyles @state.editorState.getCurrentContent().getBlockForKey(selection.anchorKey)
    else
      @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)

  promptForLink: (pluginType) ->
    selectionTarget = null
    unless window.getSelection().isCollapsed
      location = getSelectionLocation $(ReactDOM.findDOMNode(@refs.editor)).offset()
      selectionTarget = stickyControlsBox(location, 25, 200)
      url = getExistingLinkData(@state.editorState).url
      @setState
        showUrlInput: true
        showMenu: false
        focus: false
        urlValue: url
        selectionTarget: selectionTarget
        pluginType: pluginType

  confirmLink: (urlValue) ->
    { editorState } = @state
    contentState = editorState.getCurrentContent()
    if @state.pluginType
      props = { url: urlValue, className: 'is-follow-link' }
    else
      props = { url: urlValue }
    contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', props)
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
    selection = @state.editorState.getSelection()
    if !selection.isCollapsed()
      @setState({
        pluginType: null
        showUrlInput: false
        urlValue: ''
        editorState: RichUtils.toggleLink(@state.editorState, selection, null)
      })

  checkSelection: ->
    if !window.getSelection().isCollapsed
      location = getSelectionLocation $(ReactDOM.findDOMNode(@refs.editor)).offset()
      selectionTargetL = if @state.hasFeatures then 125 else 100
      @setState showMenu: true, selectionTarget: stickyControlsBox(location, -93, selectionTargetL)
    else
      @setState showMenu: false

  render: ->
    isEditing = if @props.editing then ' is-editing' else ''

    div {
      className: 'edit-section--text' + isEditing
      onClick: @focus
    },
      if @state.showMenu
        EditNav {
          hasFeatures: @state.hasFeatures
          blocks: blockTypes @props.article.get('layout')
          toggleBlock: @toggleBlockType
          styles: inlineStyles @props.article.get('layout')
          toggleStyle: @toggleInlineStyle
          promptForLink: @promptForLink
          makePlainText: @makePlainText
          position: @state.selectionTarget
        }
      div {
        className: 'edit-section--text__input'
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
          blockRenderMap: blockRenderMap @props.article.get('layout')
          handleReturn: @handleReturn
          onTab: @handleTab
          onUpArrow: @handleChangeSection
          onDownArrow: @handleChangeSection
        }
        if @props.editing and @state.showUrlInput
          InputUrl {
            removeLink: @removeLink
            confirmLink: @confirmLink
            selectionTarget: @state.selectionTarget
            pluginType: @state.pluginType
            urlValue: @state.urlValue
          }
