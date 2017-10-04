React = require 'react'
ReactDOM = require 'react-dom'
_s = require 'underscore.string'
sd = require('sharify').data
window.process = {env: {NODE_ENV: sd.NODE_ENV}}
components = require('@artsy/reaction-force/dist/components/publishing/index').default
Config = require './draft_config.coffee'
Nav = React.createFactory require '../../../../../../components/rich_text2/components/nav.coffee'
InputUrl = React.createFactory require '../../../../../../components/rich_text2/components/input_url.coffee'
Text = React.createFactory components.Text
Utils = require '../../../../../../components/rich_text2/utils/index.coffee'
{ CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  RichUtils,
  Modifier } = require 'draft-js'
editor = (props) -> React.createElement Editor, props
{ div } = React.DOM


module.exports = React.createClass
  displayName: 'SectionText'

  getInitialState: ->
    editorState: EditorState.createEmpty(new CompositeDecorator(Config.decorators(@props.article.get('layout'))))
    focus: false
    html: null
    selectionTarget: null
    showUrlInput: false
    pluginType: null
    urlValue: null
    showMenu: false
    hasFeatures: @props.channel.hasFeature 'follow'

  componentDidMount: ->
    @props.sections.on 'change:autolink', @editorStateFromProps
    if @props.section.get('body')?.length
      @editorStateFromProps()
    else if @props.editing
      @focus()

  editorStateFromProps: ->
    html = Utils.standardizeSpacing @props.section.get('body')
    unless @props.article.get('layout') is 'classic'
      html = Utils.setContentStartEnd(html, @props.article.get('layout'), @props.isStartText, @props.isEndText)
    blocksFromHTML = Utils.convertFromRichHtml html
    editorState = EditorState.createWithContent(blocksFromHTML, new CompositeDecorator(Config.decorators(@props.article.get('layout'))))
    editorState = Utils.setSelectionToStart(editorState) if @props.editing
    @setState
      html: html
      editorState: editorState

  componentDidUpdate: (prevProps) ->
    if @props.isEndText isnt prevProps.isEndText or @props.isStartText isnt prevProps.isStartText
      unless @props.article.get('layout') is 'classic'
        html = Utils.setContentStartEnd(@props.section.get('body'), @props.article.get('layout'), @props.isStartText, @props.isEndText)
      @props.section.set('body', html)
    if @props.editing and @props.editing isnt prevProps.editing
      @focus()
    else if !@props.editing and @props.editing isnt prevProps.editing
      @refs.editor.blur()

  onChange: (editorState) ->
    html = Utils.convertToRichHtml editorState, @props.article.get('layout')
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
    selection = Utils.getSelectionDetails(@state.editorState)
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
    selection = Utils.getSelectionDetails(@state.editorState)
    # only merge a section if cursor is in first character of first block
    if selection.isFirstBlock and selection.anchorOffset is 0 and
     @props.sections.models[@props.index - 1]?.get('type') is 'text'
      mergeIntoHTML = @props.sections.models[@props.index - 1].get('body')
      @props.sections.models[@props.index - 1].destroy()
      newHTML = mergeIntoHTML + @state.html
      blocksFromHTML = Utils.convertFromRichHtml newHTML
      newSectionState = EditorState.push(@state.editorState, blocksFromHTML, null)
      newSectionState = Utils.setSelectionToStart newSectionState
      @onChange newSectionState
      @props.onSetEditing @props.index - 1

  handleChangeSection: (e) ->
    direction = 0
    direction =  -1 if e.key in ['ArrowUp', 'ArrowLeft']
    direction =  1 if e.key in ['ArrowDown', 'ArrowRight']
    selection = Utils.getSelectionDetails @state.editorState
    # if cursor is arrowing forward from last charachter of last block,
    # or cursor is arrowing back from first character of first block,
    # jump to adjacent section
    if selection.isLastBlock and selection.isLastCharacter and direction is 1 or
     selection.isFirstBlock and selection.isFirstCharacter and direction is -1
      @props.onSetEditing @props.index + direction
    else if e.key in ['ArrowLeft', 'ArrowRight']
      # manually move cursor to make up for draft's missing l/r arrow fallbacks
      shift = if e.shiftKey then true else false
      newEditorState = Utils.moveSelection @state.editorState, selection, direction, shift
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
      newSectionHtml = Utils.convertToRichHtml(newSectionState)
      @onChange currentState
      @props.sections.add {type: 'text', body: newSectionHtml}, {at: @props.index + 1}
      return 'handled'

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    html = Utils.stripGoogleStyles(html)
    blocksFromHTML = Utils.convertFromRichHtml html
    convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
      unstyled = Utils.stripCharacterStyles contentBlock, true
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
      Utils.stripCharacterStyles contentBlock
    newState = ContentState.createFromBlockArray noStyles
    if !selection.isCollapsed()
      @onChange EditorState.push(editorState, newState, null)

  availableBlocks: ->
    blockMap = Config.blockRenderMap(@props.article.get('layout'), @state.hasFeatures)
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
       Utils.getSelectionDetails(@state.editorState).anchorType is 'header-three'
        return 'handled'
      newState = RichUtils.handleKeyCommand @state.editorState, e
      @onChange newState if newState
    else if e is 'strikethrough'
      @toggleInlineStyle 'STRIKETHROUGH'
    else if e is 'link-prompt'
      className = Utils.getExistingLinkData(@state.editorState).className
      return @promptForLink() unless className?.includes 'is-follow-link'
      @promptForLink 'artist'

  toggleBlockQuote: ->
    blockquote = @props.section.get('body')
    beforeBlock = _s(blockquote).strLeft('<blockquote>')?._wrapped
    afterBlock = _s(blockquote).strRight('</blockquote>')?._wrapped
    increment = 0
    if afterBlock
      blockquote = blockquote.replace(afterBlock, '')
      @props.sections.add {type: 'text', body: afterBlock}, {at: @props.index + 1}
    if beforeBlock
      blockquote = blockquote.replace(beforeBlock, '')
      @props.sections.add {type: 'text', body: beforeBlock}, {at: @props.index }
      increment = 1
    @props.section.set({body: blockquote, layout: 'blockquote'})
    @props.onSetEditing @props.index + increment

  toggleBlockType: (blockType) ->
    unless blockType is 'blockquote' and !@state.hasFeatures
      @onChange RichUtils.toggleBlockType(@state.editorState, blockType)
      @setState showMenu: false
      if blockType is 'blockquote'
        if @props.section.get('body').includes('<blockquote>')
          @toggleBlockQuote()
        else
          @props.section.set('layout', null)
    return 'handled'

  toggleInlineStyle: (inlineStyle) ->
    selection = Utils.getSelectionDetails(@state.editorState)
    if selection.anchorType is 'header-three' and @props.article.get('layout') is 'classic'
      block = @state.editorState.getCurrentContent().getBlockForKey(selection.anchorKey)
      Utils.stripCharacterStyles block
    else
      @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)

  promptForLink: (pluginType) ->
    selectionTarget = null
    unless window.getSelection().isCollapsed
      location = Utils.getSelectionLocation $(ReactDOM.findDOMNode(@refs.editor)).offset()
      selectionTarget = Utils.stickyControlsBox(location, 25, 200)
      url = Utils.getExistingLinkData(@state.editorState).url
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
    props = { url: urlValue }
    props.className = 'is-follow-link' if @state.pluginType
    contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', props)
    entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    newEditorState = EditorState.set editorState, { currentContent: contentStateWithEntity }
    @setState
      showMenu: false
      showUrlInput: false
      urlValue: ''
      selectionTarget: null
      pluginType: null
    @onChange RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey)

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
      location = Utils.getSelectionLocation $(ReactDOM.findDOMNode(@refs.editor)).offset()
      selectionTargetL = if @state.hasFeatures then 125 else 100
      @setState showMenu: true, selectionTarget: Utils.stickyControlsBox(location, -93, selectionTargetL)
    else
      @setState showMenu: false

  render: ->
    isEditing = if @props.editing then ' is-editing' else ''

    div {
      className: 'edit-section--text' + isEditing
      onClick: @focus
    },
      Text { layout: @props.article.get 'layout' },
        if @state.showMenu
          Nav {
            hasFeatures: @state.hasFeatures
            blocks: Config.blockTypes @props.article.get('layout'), @state.hasFeatures
            toggleBlock: @toggleBlockType
            styles: Config.inlineStyles @props.article.get('layout'), @state.hasFeatures
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
            decorators: Config.decorators
            handleKeyCommand: @handleKeyCommand
            keyBindingFn: Utils.keyBindingFnFull
            handlePastedText: @onPaste
            blockRenderMap: Config.blockRenderMap @props.article.get('layout'), @state.hasFeatures
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
