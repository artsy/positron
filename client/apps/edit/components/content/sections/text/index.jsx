import _s from 'underscore.string'
import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Editor, EditorState, RichUtils } from 'draft-js'
import { Text } from '@artsy/reaction-force/dist/Components/Publishing'
import { convertFromRichHtml, convertToRichHtml } from 'client/components/rich_text/utils/convert_html'
import {
  addLinkToState,
  divideEditorState,
  getSelectedLinkData,
  getSelectionDetails,
  mergeHtmlIntoState,
  setSelectionToStart,
  stickyControlsBox
} from 'client/components/rich_text/utils/text_selection'
import { setContentEnd } from 'client/components/rich_text/utils/decorators'
import {
  makePlainText,
  removeDisallowedBlocks,
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
    onChange: PropTypes.func,
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
        Config.composedDecorator(props.article.layout)
      ),
      focus: false,
      html: null,
      selectionTarget: null,
      showMenu: false,
      showUrlInput: false,
      plugin: null,
      url: null
    }

    props.sections.on('change:autolink', this.editorStateFromProps)
  }

  componentWillMount = () => {
    const { section } = this.props

    if (section.body && section.body.length) {
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

    let html = standardizeSpacing(section.body)

    if (article.layout !== 'classic') {
      html = setContentEnd(html, isContentEnd)
    }

    const blocksFromHTML = convertFromRichHtml(html)
    const decorators = Config.composedDecorator(article.layout)
    let editorState = EditorState.createWithContent(blocksFromHTML, decorators)

    if (editing) {
      editorState = setSelectionToStart(editorState)
    }

    this.setState({ editorState, html })
  }

  onChange = (editorState) => {
    const { article, onChange, section } = this.props
    const html = convertToRichHtml(editorState, article.layout)

    if (section.body !== html) {
      onChange('body', html)
    }
    this.setState({ editorState, html })
  }

  focus = () => {
    if (this.domEditor) {
      this.domEditor.focus()
    }
  }

  availableBlocks = () => {
    const { article, hasFeatures } = this.props
    const availableBlocks = Config.blockRenderMapArray(article.layout, hasFeatures)

    return availableBlocks
  }

  maybeSplitSection = (anchorKey) => {
    // Called on return
    // Maybe divide content into 2 text sections at cursor
    const { editorState } = this.state
    const { index, sections } = this.props

    const hasDividedState = divideEditorState(editorState, anchorKey)
    // If section gets divided, add new section
    if (hasDividedState) {
      const { currentSectionState, newSection } = hasDividedState

      this.onChange(currentSectionState)
      // TODO: Redux newSectionAction
      sections.add({type: 'text', body: newSection}, {at: index + 1})
    }
    return 'handled'
  }

  handleBackspace = () => {
    const { editorState, html } = this.state
    const { index, onSetEditing, sections } = this.props

    const selection = getSelectionDetails(editorState)
    const { isFirstBlock, anchorOffset } = selection

    const beforeIndex = index - 1
    const sectionBefore = sections.models[beforeIndex]
    const sectionBeforeIsText = sectionBefore.get('type') === 'text'
    const isAtFirstCharacter = anchorOffset === 0

    // only merge a section if focus is at 1st character of 1st block
    if (isFirstBlock && isAtFirstCharacter && sectionBeforeIsText) {
      const beforeHtml = sectionBefore.get('body')
      // delete section before
      sectionBefore.destroy()
      // merge html from both sections into new state
      const newState = mergeHtmlIntoState(editorState, beforeHtml, html)
      // update new section with combined html
      this.onChange(newState)
      onSetEditing(beforeIndex)
      return 'handled'
    }
    return 'not-handled'
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
    // Don't split from the first block, to avoid creating empty blocks
    // Don't split from the middle of a paragraph
    if (isFirstBlock || anchorOffset) {
      return 'not-handled'
    } else {
      e.preventDefault()
      this.maybeSplitSection(anchorKey)
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

  onPaste = (text, html) => {
    const { editorState } = this.state
    const wrappedHtml = html || '<div>' + text + '</div>'
    const formattedHtml = stripGoogleStyles(wrappedHtml)

    const blocksFromHTML = convertFromRichHtml(formattedHtml).getBlocksAsArray()
    const allowedBlocks = this.availableBlocks()
    const newState = removeDisallowedBlocks(editorState, blocksFromHTML, allowedBlocks)

    this.onChange(newState)
    return 'handled'
  }

  handleChangeSection = (e) => {
    // if cursor is arrow forward from last character of last block
    // or cursor is arrow back from first character of first block
    // jump to adjacent section
    const { editorState } = this.state
    const { index, onSetEditing } = this.state
    let direction = 0

    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
      direction = -1
    } else if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
      direction = 1
    }
    const selection = getSelectionDetails(editorState)
    const {
      isFirstBlock,
      isFirstCharacter,
      isLastBlock,
      isLastCharacter
    } = selection
    const isFirst = isFirstBlock && isFirstCharacter && direction === -1
    const isLast = isLastBlock && isLastCharacter && direction === 1

    if (isFirst || isLast) {
      onSetEditing(index + direction)
    } else {
      return true
    }
  }

  // TEXT MUTATIONS
  makePlainText = () => {
    const { editorState } = this.state
    const hasSelection = !editorState.getSelection().isCollapsed()

    if (hasSelection) {
      const newState = makePlainText(editorState)
      this.onChange(newState)
    }
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
    const { hasFeatures, onChange, section } = this.props
    const isBlockquote = block === 'blockquote'
    const hasBlockquote = clone(section.body).includes('<blockquote>')

    if (!hasFeatures && isBlockquote) {
      return 'handled'
    }

    this.onChange(RichUtils.toggleBlockType(editorState, block))
    this.setState({ showMenu: false })

    if (hasFeatures && isBlockquote) {
      if (hasBlockquote) {
        onChange('layout', null)
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
      onChange,
      onSetEditing,
      section,
      sections
    } = this.props

    let increment = 0
    let blockquote = setContentEnd(section.body, isContentEnd)
    const beforeBlock = _s(blockquote).strLeft('<blockquote>')._wrapped
    const afterBlock = _s(blockquote).strRight('</blockquote>')._wrapped

    if (afterBlock) {
      // add text before blockquote to new text section
      blockquote = blockquote.replace(afterBlock, '')
      // TODO: redux newSectionAction
      sections.add({type: 'text', body: afterBlock}, { at: index + 1 })
    }
    if (beforeBlock) {
      // add text after blockquote to new text section
      blockquote = blockquote.replace(beforeBlock, '')
      // TODO: redux newSectionAction
      sections.add({type: 'text', body: beforeBlock}, { at: index })
      increment = 1
    }
    onChange('body', blockquote)
    onChange('layout', 'blockquote')
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
    const linkData = { url }

    if (plugin) {
      linkData.className = 'is-follow-link'
    }

    const editorStateWithLink = addLinkToState(editorState, linkData)

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
    const { editorState } = this.state
    const windowHasSelection = !window.getSelection().isCollapsed
    const editorHasSelection = !editorState.getSelection().isCollapsed()

    return windowHasSelection || editorHasSelection
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
      className='SectionText edit-section--text'
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
          className='SectionText__input edit-section--text__input'
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
