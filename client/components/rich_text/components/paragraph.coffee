# A basic paragraph component: supports bold and italic styles
# optionally allows links and stripping of linebreaks
# or format in types 'postscript', 'caption' and 'lead paragraph'

# Paragraph {
#   html        *required
#   onChange    *required
#   placeholder
#   layout: article.layout
#   postscript: default=false
#   linked: default=false
#   stripLinebreaks: default=false
#   type: 'postscript' | 'caption' | 'lead paragraph'
# }

React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
Config = require '../utils/config.js'
{ keyBindingFnParagraph } = require '../utils/keybindings.js'
{ stickyControlsBox } = require '../utils/text_selection.js'
{ standardizeSpacing, stripCharacterStyles, stripGoogleStyles } = require '../utils/text_stripping.js'
{ ContentState,
  CompositeDecorator,
  Editor,
  EditorState,
  Entity,
  RichUtils,
  Modifier } = require 'draft-js'
{ convertToHTML, convertFromHTML } = require 'draft-convert'
{ div, a } = React.DOM
editor = (props) -> React.createElement Editor, props
{ Text } = require('@artsy/reaction-force/dist/Components/Publishing')
Nav = React.createFactory require './nav.coffee'
InputUrl = React.createFactory require './input_url.coffee'
Text = React.createFactory Text

module.exports = React.createClass
  displayName: 'Paragraph'

  getInitialState: ->
    editorState: EditorState.createEmpty(
      new CompositeDecorator Config.decorators(@hasLinks())
    )
    focus: false
    showUrlInput: false
    showNav: false
    urlValue: ''
    selectionTarget: null

  componentDidMount: ->
    if $(@props.html)?.text().length
      html = standardizeSpacing @props.html
      html = @stripLinebreaks(html) if @props.stripLinebreaks
      blocksFromHTML = @convertFromHTML(html)
      @setState
        html: html
        editorState: EditorState.createWithContent(
          blocksFromHTML,
          new CompositeDecorator Config.decorators(@hasLinks())
        )

  hasLinks: ->
    return true if @props.linked or @props.type in ['caption', 'postscript']

  onChange: (editorState) ->
    html = @convertToHtml editorState
    @setState editorState: editorState, html: html
    @props.onChange(html)

  focus: ->
    @setState focus: true
    @refs.editor.focus()

  onBlur: ->
    @setState
      focus: false
      showNav: false

  convertFromHTML: (html) ->
    html = @stripLinebreaks(html) if @props.stripLinebreaks
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
    html = standardizeSpacing html
    html = if html in ['<p></p>', '<p><br></p>'] then '' else html
    return html

  availableBlocks: ->
    blockMap = Config.blockRenderMap()
    available = Object.keys(blockMap.toObject())
    return Array.from(available)

  handleKeyCommand: (e) ->
    return 'handled' if @props.stripLinebreaks is true and e is 'split-block'
    if e is 'link-prompt'
      @promptForLink() if @hasLinks()
      return 'handled'
    if e in ['bold', 'italic']
      return 'handled' if @props.postscript and e is 'italic'
      return 'handled' if @props.caption and e is 'bold'
      newState = RichUtils.handleKeyCommand @state.editorState, e
      @onChange newState if newState
    return 'not-handled'

  toggleInlineStyle: (inlineStyle) ->
    @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)


  stripLinebreaks: (html) ->
    html = html.replace(/<\/p><p>/g, '')
    return html

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    html = standardizeSpacing html
    html = stripGoogleStyles html
    html = @stripLinebreaks(html) if @props.stripLinebreaks
    html = html.replace(/<\/p><p>/g, '')
    blocksFromHTML = @convertFromHTML html
    convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
      unstyled = stripCharacterStyles contentBlock, true
      unless unstyled.getType() in @availableBlocks() or unstyled.getType() is 'LINK'
        unstyled = unstyled.set 'type', 'unstyled'
      return unstyled
    blockMap = ContentState.createFromBlockArray(convertedHtml, blocksFromHTML.getBlocksAsArray()).blockMap
    newState = Modifier.replaceWithFragment(
      editorState.getCurrentContent()
      editorState.getSelection()
      blockMap
    )
    newState = EditorState.push(editorState, newState, 'insert-fragment')
    @onChange newState
    return true

  promptForLink: (e) ->
    { editorState } = @state
    e.preventDefault() if e
    selection = editorState.getSelection()
    selectionTarget = {top: 0, left: 0}
    url = ''
    if !selection.isCollapsed()
      editorPosition = $(ReactDOM.findDOMNode(@refs.editor)).offset()
      selectionTarget = stickyControlsBox(editorPosition, 25, 200)
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
      showNav: false
      urlValue: url
      selectionTarget: selectionTarget

  confirmLink: (url) ->
    { editorState } = @state
    contentState = editorState.getCurrentContent()
    contentStateWithEntity = contentState.createEntity(
      'LINK'
      'MUTABLE'
      {url: url}
    )
    entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    newEditorState = EditorState.set editorState, { currentContent: contentStateWithEntity }
    @setState({
      showUrlInput: false
      showNav: false
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
      InputUrl {
        selectionTarget: @state.selectionTarget
        removeLink: @removeLink
        confirmLink: @confirmLink
        urlValue: @state.urlValue
      }

  checkSelection: ->
    if !window.getSelection().isCollapsed
      editorPosition = $(ReactDOM.findDOMNode(@refs.editor)).offset()
      selectionTargetL = Config.inlineStyles(@props.type).length * 25
      selectionTargetL = selectionTargetL + 25 if @hasLinks()
      @setState showNav: true, selectionTarget: stickyControlsBox(editorPosition, -43, selectionTargetL)
    else
      @setState showNav: false

  renderEditor: ->
    div { className: 'rich-text--paragraph' },
      if @state.showNav
        Nav {
          styles: Config.inlineStyles(@props.type)
          toggleStyle: @toggleInlineStyle
          promptForLink: @promptForLink if @hasLinks()
          position: @state.selectionTarget
        }
      div {
        onClick: @focus
        onBlur: @onBlur
        onMouseUp: @checkSelection
        onKeyUp: @checkSelection
      },
        editor {
          ref: 'editor'
          placeholder: @props.placeholder
          editorState: @state.editorState
          spellCheck: true
          onChange: @onChange
          blockRenderMap: Config.blockRenderMap()
          handleKeyCommand: @handleKeyCommand
          keyBindingFn: keyBindingFnParagraph
          handlePastedText: @onPaste
        }
      @printUrlInput()

  render: ->
    if @props.type is 'caption'
      @renderEditor()
    else
      Text {
        layout: @props.layout || 'classic'
        postscript: @props.type is 'postscript'
      },
        @renderEditor()
