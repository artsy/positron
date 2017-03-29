# A basic paragraph component including bold and italic by default

# RichTextParagraph {
#   text        *required
#   onChange    *required
#   placeholder
#   styleMap: ['italic', 'underline'] #overrides default styles
# }

React = require 'react'
sd = require('sharify').data
window.process = {env: {NODE_ENV: sd.NODE_ENV}}
{ ContentState,
  Editor,
  EditorState,
  RichUtils,
  Modifier } = require 'draft-js'
{ convertToHTML, convertFromHTML } = require 'draft-convert'
{ div } = React.DOM
editor = (props) -> React.createElement Editor, props

module.exports = React.createClass
  displayName: 'RichTextParagraph'

  getInitialState: ->
    editorState: EditorState.createEmpty()
    focus: false
    styleMap: @props.styleMap || ['bold', 'italic']

  componentDidMount: ->
    if $(@props.text).text().length
      blocksFromHTML = @convertFromHTML(@props.text)
      @setState
        html: @props.text
        editorState: EditorState.createWithContent(blocksFromHTML)

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
    blocksFromHTML = convertFromHTML({})(html)
    return blocksFromHTML

  convertToHtml: (editorState) ->
    html = convertToHTML({})(editorState.getCurrentContent())
    html = html.replace('  ', ' &nbsp;')
    return html

  onPaste: (text, html) ->
    { editorState } = @state
    unless html
      html = '<div>' + text + '</div>'
    blocksFromHTML = @convertFromHTML(html)
    convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
      unstyled = @stripPastedStyles contentBlock
      unless unstyled.getType() is 'unstyled'
        unstyled = unstyled.set('type', 'unstyled')
      return unstyled
    blockMap = ContentState.createFromBlockArray(convertedHtml, blocksFromHTML.entityMap).blockMap
    newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap)
    this.onChange(EditorState.push(editorState, newState, 'insert-fragment'))
    return true

  stripPastedStyles: (contentBlock) ->
    styleMap = @state.styleMap.map (style) ->
      return style.toUpperCase()
    characterList = contentBlock.getCharacterList().map (character) ->
      if character.get('style') not in styleMap
        character.set('style', character.get('style').clear())
    unstyled = contentBlock.set('characterList', characterList)
    return unstyled

  handleKeyCommand: (e) ->
    if e in @state.styleMap
      newState = RichUtils.handleKeyCommand @state.editorState, e
      if newState
        @onChange newState
        return true
    return false

  render: ->
    div { className: 'rich-text--paragraph' },
      div {
        className: 'rich-text--paragraph__input'
        onClick: @focus
        onBlur: @onBlur
      },
        editor {
          ref: 'editor'
          placeholder: @props.placeholder
          editorState: @state.editorState
          spellCheck: true
          onChange: @onChange
          handlePastedText: @onPaste
          handleKeyCommand: @handleKeyCommand
        }
