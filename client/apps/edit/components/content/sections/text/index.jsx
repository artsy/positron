import _s from 'underscore.string'
import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  RichUtils,
  Modifier
} from 'draft-js'
import { Text } from '@artsy/reaction-force/dist/Components/Publishing'
import { convertFromRichHtml, convertToRichHtml } from 'client/components/rich_text/utils/convert_html'
import {
  setSelectionToStart,
  stickyControlsBox,
  getSelectedLinkData,
  getSelectionDetails
} from 'client/components/rich_text/utils/text_selection'
import { setContentEnd } from 'client/components/rich_text/utils/decorators'
import {
  standardizeSpacing,
  stripCharacterStyles,
  stripGoogleStyles
} from 'client/components/rich_text/utils/text_stripping'
import { keyBindingFnFull } from 'client/components/rich_text/utils/keybindings'
import { TextInputUrl } from 'client/components/rich_text/components/input_url'
import { TextNav } from 'client/components/rich_text/components/text_nav'
import * as Config from './draft_config'

export class SectionText extends Component {
  static propTypes = {
    article: PropTypes.object,
    editing: PropTypes.bool,
    hasFeatures: PropTypes.bool,
    index: PropTypes.number,
    isContentEnd: PropTypes.bool,
    isContentStart: PropTypes.bool,
    onSetEditing: PropTypes.func,
    section: PropTypes.object,
    sections: PropTypes.object
  }

  constructor (props) {
    super(props)

    this.state = {
      editorState: EditorState.createEmpty(
        new CompositeDecorator(
          Config.decorators(props.article.layout)
        )
      ),
      focus: false,
      html: null,
      selectionTarget: null,
      showMenu: false,
      showUrlInput: false,
      plugin: null,
      url: null
    }
  }

  componentWillMount = () => {
    const { section } = this.props

    if (section.get('body') && section.get('body').length) {
      this.setEditorStateFromProps()
    }
  }

  // EDITOR AND CONTENT STATE
  setEditorStateFromProps = () => {
    const {
      article,
      editing,
      isContentEnd,
      section
    } = this.props

    let html = standardizeSpacing(section.get('body'))

    if (article.layout !== 'classic') {
      html = setContentEnd(html, isContentEnd)
    }

    const blocksFromHTML = convertFromRichHtml(html)
    const decorators = new CompositeDecorator(Config.decorators(article.layout))
    let editorState = EditorState.createWithContent(blocksFromHTML, decorators)

    if (editing) {
      editorState = setSelectionToStart(editorState)
    }

    this.setState({ editorState, html })
  }

  onChange = (editorState) => {
    const { article, section } = this.props
    const html = convertToRichHtml(editorState, article.layout)

    this.setState({ editorState, html })
    section.set('body', html)
  }

  focus = () => {
    if (this.domEditor) {
      this.domEditor.focus()
    }
  }

  availableBlocks = () => {
    const { article, hasFeatures } = this.props
    const blockMap = Config.blockRenderMap(article.layout, hasFeatures)
    const available = Object.keys(blockMap.toObject())

    return Array.from(available)
  }

  splitSection = (anchorKey) => {
    // Divide content into 2 text sections from cursor
    const { editorState } = this.state
    const { index, sections } = this.props

    const blockArray = editorState.getCurrentContent().getBlocksAsArray()
    let currentBlocks
    let newBlocks

    for (const [index, block] of blockArray) {
      if (block.getKey() === anchorKey) {
        currentBlocks = blockArray.splice(0, index)
        newBlocks = clone(blockArray)
      }
    }
    if (currentBlocks) {
      const currentContent = ContentState.createFromBlockArray(currentBlocks)
      const currentState = EditorState.push(
        editorState, currentContent, 'remove-range'
      )
      const newContent = ContentState.createFromBlockArray(newBlocks)
      const newState = EditorState.push(
        editorState, newContent, null
      )
      const newHtml = convertToRichHtml(newState)

      this.onChange(currentState)
      sections.add({type: 'text', body: newHtml}, {at: index + 1})
      return 'handled'
    }
  }

  // KEYBOARD ACTIONS
  handleKeyCommand = (key) => {
    const { editorState } = this.state
    const isValidBlock = this.availableBlocks().includes(key)

    if (isValidBlock) {
      return this.toggleBlock(key)
    } else {
      switch (key) {
        case 'backspace': {
          return this.handleBackspace(key)
        }
        case 'custom-clear': {
          return this.makePlainText()
        }
        case 'link-prompt': {
          const className = getSelectedLinkData(editorState).className
          const hasPlugin = className && className.includes('is-follow-link')

          if (hasPlugin) {
            return this.promptForLink('artist')
          } else {
            return this.promptForLink()
          }
        }
        case 'bold':
        case 'italic':
        case 'strikethrough': {
          return this.toggleStyle(key.toUpperCase())
        }
        default: {
          return 'not-handled'
        }
      }
    }
  }

  handleReturn = (e) => {
    const { editorState } = this.state
    const {
      anchorKey,
      anchorOffset,
      isFirstBlock
    } = getSelectionDetails(editorState)

    // dont split from the first block, to avoid creating empty blocks
    // dont split from the middle of a paragraph
    if (isFirstBlock || anchorOffset) {
      return 'not-handled'
    } else {
      e.preventDefault()
      this.splitSection(anchorKey)
      return 'handled'
    }
  }

  handleTab = (e) => {
    // jump to next section
    const { index, onSetEditing } = this.props
    let newIndex = index + 1

    if (e.shiftKey && index !== 0) {
      // shift-tab to previous section
      newIndex = index - 1
    }

    e.preventDefault()
    onSetEditing(newIndex)
  }

  onPaste = () => {
    console.log('onPaste')
  }

  handleChangeSection = () => {
    console.log('handleChangeSection')
  }

  // TEXT MUTATIONS
  makePlainText = () => {
    console.log('makePlainText')
  }

  toggleStyle = (style) => {
    const { editorState } = this.state
    const { layout } = this.props.article

    const selection = getSelectionDetails(editorState)
    const isH3 = selection.anchorType === 'header-three'
    const isClassic = layout === 'classic'

    if (isH3 && isClassic) {
      // Dont allow inline styles in avant-garde font
      const block = editorState.getCurrentContent().getBlockForKey(selection.anchorKey)
      stripCharacterStyles(block)
    } else {
      this.onChange(RichUtils.toggleInlineStyle(editorState, style))
    }
  }

  toggleBlock = (block) => {
    const { editorState } = this.state
    const { hasFeatures, section } = this.props
    const isBlockquote = block === 'blockquote'
    const hasBlockquote = clone(section.get('body')).includes('<blockquote>')

    if (!hasFeatures && isBlockquote) {
      return 'handled'
    }

    this.onChange(RichUtils.toggleBlockType(editorState, block))
    this.setState({ showMenu: false })

    if (hasFeatures && isBlockquote) {
      if (hasBlockquote) {
        section.set('layout', null)
      } else {
        this.toggleBlockQuote()
      }
    }
    return 'handled'
  }

  toggleBlockQuote = () => {
    const {
      index,
      isContentEnd,
      section,
      sections,
      onSetEditing
    } = this.props

    let increment = 0
    let blockquote = setContentEnd(section.get('body'), isContentEnd)
    const beforeBlock = _s(blockquote).strLeft('<blockquote>')._wrapped
    const afterBlock = _s(blockquote).strRight('</blockquote>')._wrapped

    if (afterBlock) {
      // add text before blockquote to new text section
      blockquote = blockquote.replace(afterBlock, '')
      sections.add({type: 'text', body: afterBlock}, { at: index + 1 })
    }
    if (beforeBlock) {
      // add text after blockquote to new text section
      blockquote = blockquote.replace(beforeBlock, '')
      sections.add({type: 'text', body: beforeBlock}, { at: index })
      increment = 1
    }

    section.set({body: blockquote, layout: 'blockquote'})
    onSetEditing(index + increment)
  }

  // LINKS
  promptForLink = (plugin) => {
    const { editorState } = this.state

    if (this.domEditor && this.hasSelection()) {
      const editor = ReactDOM.findDOMNode(this.domEditor)
      const editorPosition = editor.getBoundingClientRect()
      const selectionTarget = stickyControlsBox(editorPosition, 25, 200)
      const url = getSelectedLinkData(editorState).url

      this.setState({
        showUrlInput: true,
        showMenu: false,
        url,
        selectionTarget,
        plugin
      })
    }
  }

  confirmLink = (url) => {
    const { editorState, plugin } = this.state
    const contentState = editorState.getCurrentContent()
    const linkProps = { url }

    if (plugin) {
      linkProps.className = 'is-follow-link'
    }
    const currentContent = contentState.createEntity(
      'LINK',
      'MUTABLE',
      linkProps
    )
    const entityKey = currentContent.getLastCreatedEntityKey()
    const editorStateWithEntity = EditorState.set(editorState, { currentContent })
    const editorStateWithLink = RichUtils.toggleLink(
      editorStateWithEntity,
      editorStateWithEntity.getSelection(),
      entityKey
    )

    this.setState({
      showMenu: false,
      showUrlInput: false,
      url: '',
      selectionTarget: null,
      plugin: null
    })
    this.onChange(editorStateWithLink)
  }

  removeLink = () => {
    const { editorState } = this.state
    const selection = editorState.getSelection()

    const props = {
      editorState,
      plugin: null,
      showUrlInput: false,
      url: ''
    }

    if (!selection.isCollapsed()) {
      props.editorState = RichUtils.toggleLink(editorState, selection, null)
    }
    this.setState(props)
  }

  // TEXT SELECTION
  hasSelection = () => {
    return !window.getSelection().isCollapsed
  }

  checkSelection = () => {
    const { hasFeatures } = this.props

    if (this.domEditor) {
      if (this.hasSelection()) {
        const editor = ReactDOM.findDOMNode(this.domEditor)
        const editorPosition = editor.getBoundingClientRect()
        const selectionLeft = hasFeatures ? 125 : 100
        const selectionTarget = stickyControlsBox(editorPosition, -93, selectionLeft)

        this.setState({
          showMenu: true,
          selectionTarget
        })
      } else {
        this.setState({showMenu: false})
      }
    }
  }

  render () {
    const {
      article,
      editing,
      hasFeatures,
      isContentStart
    } = this.props
    const {
      editorState,
      selectionTarget,
      showMenu,
      showUrlInput,
      plugin,
      url
    } = this.state

    const blocks = Config.blockTypes(article.layout, hasFeatures)
    const blockRenderMap = Config.blockRenderMap(article.layout, hasFeatures)
    const styles = Config.inlineStyles(article.layout, hasFeatures)
    const showDropCaps = editing ? false : isContentStart

    return (
    <div
      className='edit-section--text'
      data-editing={editing}
      onClick={this.focus}
    >
      <Text
        layout={article.layout}
        isContentStart={showDropCaps}
      >
        {showMenu &&
          <TextNav
            blocks={blocks}
            hasFeatures={hasFeatures}
            makePlainText={this.makePlainText}
            promptForLink={this.promptForLink}
            styles={styles}
            toggleBlock={this.toggleBlock}
            toggleStyle={this.toggleStyle}
            position={selectionTarget}
          />
        }
        <div
          className='edit-section--text__input'
          onMouseUp={this.checkSelection}
          onKeyUp={this.checkSelection}
        >
          <Editor
            ref={(ref) => { this.domEditor = ref }}
            blockRenderMap={blockRenderMap}
            decorators={Config.decorators}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            handlePastedText={this.onPaste}
            handleReturn={this.handleReturn}
            keyBindingFn={keyBindingFnFull}
            onChange={this.onChange}
            onTab={this.handleTab}
            onLeftArrow={this.handleChangeSection}
            onUpArrow={this.handleChangeSection}
            onRightArrow={this.handleChangeSection}
            onDownArrow={this.handleChangeSection}
            spellcheck
          />
        </div>

        {editing && showUrlInput &&
          <TextInputUrl
            removeLink={this.removeLink}
            confirmLink={this.confirmLink}
            selectionTarget={selectionTarget}
            pluginType={plugin}
            urlValue={url}
          />
        }

      </Text>
    </div>
    )
  }
}


//   componentDidMount: ->
//     @props.sections.on 'change:autolink', @editorStateFromProps
//     if @props.section.get('body')?.length
//       @editorStateFromProps()
//     else if @props.editing
//       @focus()

//   componentDidUpdate: (prevProps) ->
//     if @props.isContentEnd isnt prevProps.isContentEnd
//       unless @props.article.layout is 'classic'
//         html = setContentEnd(@props.section.get('body'), @props.isContentEnd)
//       @props.section.set('body', html)
//     if @props.editing and @props.editing isnt prevProps.editing
//       @focus()
//     else if !@props.editing and @props.editing isnt prevProps.editing
//       @refs.editor.blur()

//   onClickOff: -> #called from sectionContainer
//     @setState focus: false, showMenu: false, showUrlInput: false
//     @props.section.destroy() if @props.section.get('body') is ''
//     @refs.editor.blur()

//   focus: ->
//     @setState focus: true
//     @refs.editor.focus()

//   handleReturn: (e) ->
//     selection = getSelectionDetails(@state.editorState)
//     # dont split from the first block, to avoid creating empty blocks
//     # dont split from the middle of a paragraph
//     if selection.isFirstBlock or selection.anchorOffset
//       return 'not-handled'
//     else
//       e.preventDefault()
//       @splitSection(selection.anchorKey)
//       return 'handled'

//   handleTab: (e) ->
//     e.preventDefault()
//     index = @props.index + 1
//     if e.shiftKey
//       index = @props.index - 1
//     @props.onSetEditing index

//   handleBackspace: (e) ->
//     selection = getSelectionDetails(@state.editorState)
//     # only merge a section if cursor is in first character of first block
//     if selection.isFirstBlock and selection.anchorOffset is 0 and
//     @props.sections.models[@props.index - 1]?.get('type') is 'text'
//       mergeIntoHTML = @props.sections.models[@props.index - 1].get('body')
//       @props.sections.models[@props.index - 1].destroy()
//       newHTML = mergeIntoHTML + @state.html
//       blocksFromHTML = convertFromRichHtml newHTML
//       newSectionState = EditorState.push(@state.editorState, blocksFromHTML, null)
//       newSectionState = setSelectionToStart newSectionState
//       @onChange newSectionState
//       @props.onSetEditing @props.index - 1

//   handleChangeSection: (e) ->
//     direction = 0
//     direction =  -1 if e.key in ['ArrowUp', 'ArrowLeft']
//     direction =  1 if e.key in ['ArrowDown', 'ArrowRight']
//     selection = getSelectionDetails @state.editorState
//     # if cursor is arrowing forward from last charachter of last block,
//     # or cursor is arrowing back from first character of first block,
//     # jump to adjacent section
//     if selection.isLastBlock and selection.isLastCharacter and direction is 1 or
//     selection.isFirstBlock and selection.isFirstCharacter and direction is -1
//       @props.onSetEditing @props.index + direction
//     else
//       return true

//   splitSection: (anchorKey) ->
//     { editorState } = @state
//     blockArray = editorState.getCurrentContent().getBlocksAsArray()
//     for block, i in blockArray
//       if block?.getKey() is anchorKey
//         currentBlockArray = blockArray.splice(0, i)
//         newBlockArray = blockArray
//     if currentBlockArray
//       currentContent = ContentState.createFromBlockArray currentBlockArray
//       currentState = EditorState.push(editorState, currentContent, 'remove-range')
//       newSectionContent = ContentState.createFromBlockArray newBlockArray
//       newSectionState = EditorState.push(editorState, newSectionContent, null)
//       newSectionHtml = convertToRichHtml(newSectionState)
//       @onChange currentState
//       @props.sections.add {type: 'text', body: newSectionHtml}, {at: @props.index + 1}
//       return 'handled'

//   onPaste: (text, html) ->
//     { editorState } = @state
//     unless html
//       html = '<div>' + text + '</div>'
//     html = stripGoogleStyles(html)
//     blocksFromHTML = convertFromRichHtml html
//     convertedHtml = blocksFromHTML.getBlocksAsArray().map (contentBlock) =>
//       unstyled = stripCharacterStyles contentBlock, true
//       unless unstyled.getType() in @availableBlocks() or unstyled.getType() is 'LINK'
//         unstyled = unstyled.set 'type', 'unstyled'
//       return unstyled
//     blockMap = ContentState.createFromBlockArray(convertedHtml, blocksFromHTML.getBlocksAsArray()).blockMap
//     newState = Modifier.replaceWithFragment(editorState.getCurrentContent(), editorState.getSelection(), blockMap)
//     @onChange EditorState.push(editorState, newState, 'insert-fragment')
//     return 'handled'

//   makePlainText: () ->
//     { editorState } = @state
//     selection = editorState.getSelection()
//     noLinks = RichUtils.toggleLink editorState, selection, null
//     noBlocks = RichUtils.toggleBlockType noLinks, 'unstyled'
//     noStyles = noBlocks.getCurrentContent().getBlocksAsArray().map (contentBlock) ->
//       stripCharacterStyles contentBlock
//     newState = ContentState.createFromBlockArray noStyles
//     if !selection.isCollapsed()
//       @onChange EditorState.push(editorState, newState, null)

//   availableBlocks: ->
//     blockMap = Config.blockRenderMap(@props.article.layout, @props.hasFeatures)
//     available = Object.keys(blockMap.toObject())
//     return Array.from(available)

//   handleKeyCommand: (e) ->
//     if e in @availableBlocks()
//       @toggleBlockType e
//     else if e is 'custom-clear'
//       @makePlainText()
//     else if e is 'backspace'
//       @handleBackspace e
//     else if e in ['italic', 'bold']
//       if @props.article.layout is 'classic' and
//       getSelectionDetails(@state.editorState).anchorType is 'header-three'
//         return 'handled'
//       newState = RichUtils.handleKeyCommand @state.editorState, e
//       @onChange newState if newState
//     else if e is 'strikethrough'
//       @toggleInlineStyle 'STRIKETHROUGH'
//     else if e is 'link-prompt'
//       className = getSelectedLinkData(@state.editorState).className
//       return @promptForLink() unless className?.includes 'is-follow-link'
//       @promptForLink 'artist'

//   toggleBlockQuote: ->
//     blockquote = @props.section.get('body')
//     beforeBlock = _s(blockquote).strLeft('<blockquote>')?._wrapped
//     afterBlock = _s(blockquote).strRight('</blockquote>')?._wrapped
//     increment = 0
//     if afterBlock
//       blockquote = blockquote.replace(afterBlock, '')
//       @props.sections.add {type: 'text', body: afterBlock}, {at: @props.index + 1}
//     if beforeBlock
//       blockquote = blockquote.replace(beforeBlock, '')
//       @props.sections.add {type: 'text', body: beforeBlock}, {at: @props.index }
//       increment = 1
//     @props.section.set({body: blockquote, layout: 'blockquote'})
//     @props.onSetEditing @props.index + increment

//   toggleBlockType: (blockType) ->
//     unless blockType is 'blockquote' and !@props.hasFeatures
//       @onChange RichUtils.toggleBlockType(@state.editorState, blockType)
//       @setState showMenu: false
//       if blockType is 'blockquote'
//         if @props.section.get('body').includes('<blockquote>')
//           @toggleBlockQuote()
//         else
//           @props.section.set('layout', null)
//     return 'handled'

//   toggleInlineStyle: (inlineStyle) ->
//     selection = getSelectionDetails(@state.editorState)
//     if selection.anchorType is 'header-three' and @props.article.layout is 'classic'
//       block = @state.editorState.getCurrentContent().getBlockForKey(selection.anchorKey)
//       stripCharacterStyles block
//     else
//       @onChange RichUtils.toggleInlineStyle(@state.editorState, inlineStyle)

//   promptForLink: (pluginType) ->
//     selectionTarget = null
//     unless window.getSelection().isCollapsed
//       editorPosition = $(ReactDOM.findDOMNode(@refs.editor)).offset()
//       selectionTarget = stickyControlsBox(editorPosition, 25, 200)
//       url = getSelectedLinkData(@state.editorState).url
//       @setState
//         showUrlInput: true
//         showMenu: false
//         focus: false
//         urlValue: url
//         selectionTarget: selectionTarget
//         pluginType: pluginType

//   confirmLink: (urlValue) ->
//     { editorState } = @state
//     contentState = editorState.getCurrentContent()
//     props = { url: urlValue }
//     props.className = 'is-follow-link' if @state.pluginType
//     contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', props)
//     entityKey = contentStateWithEntity.getLastCreatedEntityKey()
//     newEditorState = EditorState.set editorState, { currentContent: contentStateWithEntity }
//     @setState
//       showMenu: false
//       showUrlInput: false
//       urlValue: ''
//       selectionTarget: null
//       pluginType: null
//     @onChange RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey)

//   removeLink: (e) ->
//     e?.preventDefault()
//     selection = @state.editorState.getSelection()
//     if !selection.isCollapsed()
//       @setState({
//         pluginType: null
//         showUrlInput: false
//         urlValue: ''
//         editorState: RichUtils.toggleLink(@state.editorState, selection, null)
//       })

//   checkSelection: ->
//     if !window.getSelection().isCollapsed
//       editorPosition = $(ReactDOM.findDOMNode(@refs.editor)).offset()
//       selectionTargetL = if @props.hasFeatures then 125 else 100
//       @setState showMenu: true, selectionTarget: stickyControlsBox(editorPosition, -93, selectionTargetL)
//     else
//       @setState showMenu: false

//   render: ->
//     showDropCaps = if @props.editing then false else @props.isContentStart

//     div {
//       className: 'edit-section--text'
//       onClick: @focus
//       'data-editing': @props.editing
//     },
//       Text {
//         layout: @props.article.layout
//         isContentStart: showDropCaps
//       },
//         if @state.showMenu
//           React.createElement(
//             TextNav, {
//               hasFeatures: @props.hasFeatures
//               blocks: Config.blockTypes @props.article.layout, @props.hasFeatures
//               toggleBlock: @toggleBlockType
//               styles: Config.inlineStyles @props.article.layout, @props.hasFeatures
//               toggleStyle: @toggleInlineStyle
//               promptForLink: @promptForLink
//               makePlainText: @makePlainText
//               position: @state.selectionTarget
//             }
//           )
//         div {
//           className: 'edit-section--text__input'
//           onMouseUp: @checkSelection
//           onKeyUp: @checkSelection
//         },
//           editor {
//             ref: 'editor'
//             editorState: @state.editorState
//             spellCheck: true
//             onChange: @onChange
//             decorators: Config.decorators
//             handleKeyCommand: @handleKeyCommand
//             keyBindingFn: keyBindingFnFull
//             handlePastedText: @onPaste
//             blockRenderMap: Config.blockRenderMap @props.article.layout, @props.hasFeatures
//             handleReturn: @handleReturn
//             onTab: @handleTab
//             onLeftArrow: @handleChangeSection
//             onUpArrow: @handleChangeSection
//             onRightArrow: @handleChangeSection
//             onDownArrow: @handleChangeSection
//           }
//           if @props.editing and @state.showUrlInput
//             React.createElement(
//               TextInputUrl, {
//                 removeLink: @removeLink
//                 confirmLink: @confirmLink
//                 selectionTarget: @state.selectionTarget
//                 pluginType: @state.pluginType
//                 urlValue: @state.urlValue
//               }
//             )
