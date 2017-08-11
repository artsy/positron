# A basic paragraph component supports bold and italic styles,
# optionally links, and linebreaks, and can format in
# types of postscript, caption or lead paragraph

# RichTextParagraph {
#   html        *required
#   onChange    *required
#   placeholder
#   layout: article.layout
#   postscript: default false
#   linked: default false
#   linebreaks: default true
# }

React = require 'react'
ReactDOM = require 'react-dom'
sd = require('sharify').data
window.process = {env: {NODE_ENV: sd.NODE_ENV}}
Config = require '../utils/config.coffee'
Utils = require '../utils/index.coffee'
{ ContentState,
  CompositeDecorator,
  Editor,
  EditorState,
  RichUtils,
  Modifier } = require 'draft-js'
{ convertToHTML, convertFromHTML } = require 'draft-convert'
{ div, a } = React.DOM
editor = (props) -> React.createElement Editor, props
components = require('@artsy/reaction-force/dist/components/publishing/index').default
InputUrl = React.createFactory require './input_url.coffee'
Text = React.createFactory components.Text

module.exports = React.createClass
  displayName: 'RichTextParagraph'

  getInitialState: ->
    editorState: EditorState.createEmpty(
      new CompositeDecorator Config.decorators(@hasLinks())
    )
    focus: false
    showUrlInput: false
    showMenu: false
    urlValue: ''
    selectionTarget: null

  componentDidMount: ->
    if $(@props.html).text().length
      blocksFromHTML = @convertFromHTML(@props.html)
      @setState
        html: @props.html
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
    @setState focus: false

  convertFromHTML: (html) ->
    blocksFromHTML = convertFromHTML({
      htmlToEntity: (nodeName, node) ->
        if nodeName is 'a'
          debugger
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
          debugger
          return a { href: entity.data.url}
        return originalText
    })(editorState.getCurrentContent())
    html = html
      .replace /(\r\n|\n|\r)/gm, ''
      .replace /<\/p><p>/g, ' '
      .replace(/  /g, ' &nbsp;')
    html = if html is '<p></p>' then '' else html
    return html

  handleKeyCommand: (e) ->
    return 'handled' if @props.linebreaks is false and e is 'split-block'
    if e is 'link-prompt'
      @promptForLink() if @hasLinks()
      return 'handled'
    if e in ['bold', 'italic']
      return 'handled' if @props.postscript and e is 'italic'
      return 'handled' if @props.caption and e is 'bold'
      newState = RichUtils.handleKeyCommand @state.editorState, e
      @onChange newState if newState
    return 'not-handled'

  promptForLink: (e) ->
    { editorState } = @state
    e.preventDefault() if e
    selection = editorState.getSelection()
    selectionTarget = {top: 0, left: 0}
    url = ''
    if !selection.isCollapsed()
      location = Utils.getSelectionLocation $(ReactDOM.findDOMNode(@refs.editor)).offset()
      selectionTarget = Utils.stickyControlsBox(location, 25, 200)
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

  confirmLink: (url) ->
    debugger
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

  printUrlInput: ->
    if @state.showUrlInput
      InputUrl {
        selectionTarget: @state.selectionTarget
        removeLink: @removeLink
        confirmLink: @confirmLink
        urlValue: @state.urlValue
      }

  render: ->
    Text {
      layout: @props.layout
      postscript: @props.postscript
    },
      div {
        className: 'rich-text--paragraph'
        onClick: @focus
        onBlur: @onBlur
      },
        editor {
          ref: 'editor'
          placeholder: @props.placeholder
          editorState: @state.editorState
          spellCheck: true
          onChange: @onChange
          blockRenderMap: Config.blockRenderMap()
          handleReturn: @handleReturn
          handleKeyCommand: @handleKeyCommand
          keyBindingFn: Utils.keyBindingFnCaption
          # handlePastedText: @onPaste
        }
      @printUrlInput()