import { clone } from 'lodash'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Editor, EditorState, RichUtils } from 'draft-js'
import { Text } from '@artsy/reaction/dist/Components/Publishing'
import * as KeyBindings from 'client/components/rich_text/utils/keybindings'
import * as Selection from 'client/components/rich_text/utils/text_selection'
import * as Strip from 'client/components/rich_text/utils/text_stripping'
import * as Config from './draft_config'
import { convertFromRichHtml, convertToRichHtml } from 'client/components/rich_text/utils/convert_html'
import { TextInputUrl } from 'client/components/rich_text/components/input_url'
import { TextNav } from 'client/components/rich_text/components/text_nav'
import { onChangeSection, newSection, removeSection } from 'client/actions/edit/sectionActions'
import { getContentStartEnd } from 'client/models/article.js'

export class SectionText extends Component {
  static propTypes = {
    article: PropTypes.object,
    editing: PropTypes.bool,
    hasFeatures: PropTypes.bool,
    index: PropTypes.number,
    onChangeSectionAction: PropTypes.func,
    newSectionAction: PropTypes.func,
    onSetEditing: PropTypes.func,
    removeSectionAction: PropTypes.func,
    section: PropTypes.object,
    sectionIndex: PropTypes.number
  }

  constructor (props) {
    super(props)

    this.state = {
      editorState: EditorState.createEmpty(
        Config.composedDecorator(props.article.layout)
      ),
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

    if (section.body && section.body.length) {
      this.setEditorStateFromProps()
    }
  }

  componentDidMount = () => {
    if (this.isEditing()) {
      this.focus()
    }
  }

  componentDidUpdate = (prevProps) => {
    this.maybeResetEditor(prevProps)
  }

  // EDITOR AND CONTENT STATE
  setEditorStateFromProps = () => {
    const { editorState, html } = Config.setEditorStateFromProps(this.props)
    this.setState({ editorState, html })
  }

  onChange = (editorState) => {
    const { article, hasFeatures, onChangeSectionAction, section } = this.props
    const html = convertToRichHtml(editorState, article.layout, hasFeatures)

    if (section.body !== html) {
      // Don't call onChange for focus changes
      onChangeSectionAction('body', html)
    }
    this.setState({ editorState, html })
  }

  isEditing = () => {
    const { index, sectionIndex } = this.props

    return index === sectionIndex
  }

  blur = () => {
    if (this.domEditor) {
      this.domEditor.blur()
    }
  }

  focus = () => {
    if (this.domEditor) {
      this.domEditor.focus()
    }
  }

  maybeResetEditor = (prevProps) => {
    const { editing, section } = this.props
    const { html } = this.state

    const bodyHasChanged = section.body !== prevProps.section.body && section.body.length > 0
    const bodyWasSwapped = bodyHasChanged && section.body !== html
    const startedEditing = editing && editing !== prevProps.editing
    const stoppedEditing = !editing && editing !== prevProps.editing

    if (startedEditing || bodyWasSwapped) {
      if (bodyHasChanged) {
        // Re-initialize editor with new text, happens during
        // drag/drop or changing edit section w/ handleTab or splitSection
        this.setEditorStateFromProps()
      } else {
        // Focus editor if editing
        this.focus()
      }
    } else if (stoppedEditing) {
      // Blur editor if no longer editing
      this.blur()
    }
  }

  maybeSplitSection = (anchorKey) => {
    // Called on return
    const { editorState } = this.state
    const { article, index, newSectionAction } = this.props

    const hasDividedState = Selection.divideEditorState(editorState, anchorKey, article.layout)
    // If section gets divided, add new section
    if (hasDividedState) {
      const { currentSectionState, newSection } = hasDividedState

      this.onChange(currentSectionState)
      newSectionAction('text', index + 1, {body: newSection})
      return 'handled'
    }
    return 'not-handled'
  }

  isContentStart = () => {
    const { article, index } = this.props

    return getContentStartEnd(article).start === index
  }

  handleBackspace = () => {
    const { editorState, html } = this.state
    const {
      article: { sections },
      index,
      onChangeSectionAction,
      onSetEditing,
      removeSectionAction
    } = this.props
    const hasSelection = editorState.getSelection().getAnchorOffset() > 0

    if (!hasSelection && index !== 0) {
      // Maybe merge sections if no text selected, and not first section
      const beforeIndex = index - 1
      const sectionBefore = sections[beforeIndex]
      const sectionBeforeIsText = sectionBefore && sectionBefore.type === 'text'
      const hasBlockquote = sectionBeforeIsText && sectionBefore.body.includes('<blockquote>') || html.includes('<blockquote>')
      const newState = KeyBindings.handleBackspace(editorState, html, sectionBefore)

      if (newState) {
        if (hasBlockquote) {
          // remove layout/blockquotes when merging sections together
          onChangeSectionAction('layout', null)
        }
        this.onChange(newState)
        removeSectionAction(beforeIndex)
        onSetEditing(beforeIndex)
        return 'handled'
      }
    } else {
      return 'not-handled'
    }
  }

  // KEYBOARD ACTIONS
  handleKeyCommand = (key) => {
    const { article, hasFeatures } = this.props
    const availableBlocks = Config.blockRenderMapArray(article.layout, hasFeatures)
    const isValidBlock = availableBlocks.includes(key)

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
          return this.promptForLink()
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
    return KeyBindings.handleReturn(e, editorState, this.maybeSplitSection)
  }

  handleTab = (e) => {
    // jump to next or previous section
    const { index, onSetEditing } = this.props
    KeyBindings.handleTab(e, index, onSetEditing)
  }

  onPaste = (text, html) => {
    const { article, hasFeatures } = this.props
    const { editorState } = this.state

    const newState = KeyBindings.onPaste(
      { text, html },
      editorState,
      article.layout,
      hasFeatures,
      true
    )

    this.onChange(newState)
    return 'handled'
  }

  handleChangeSection = (e) => {
    const { editorState } = this.state
    const { index, onSetEditing } = this.props

    KeyBindings.handleChangeSection(editorState, e.key, index, onSetEditing)
  }

  // TEXT MUTATIONS
  makePlainText = () => {
    const { editorState } = this.state

    if (Selection.hasSelection(editorState)) {
      const newState = Strip.makePlainText(editorState)
      this.onChange(newState)
    }
  }

  toggleStyle = (style) => {
    const { editorState } = this.state
    const { layout } = this.props.article

    const selection = Selection.getSelectionDetails(editorState)
    const isH3 = selection.anchorType === 'header-three'
    const isClassic = layout === 'classic'

    if (isH3 && isClassic) {
      // Dont allow inline styles in avant-garde font
      const block = editorState.getCurrentContent().getBlockForKey(selection.anchorKey)
      Strip.stripCharacterStyles(block)
    }
    this.onChange(RichUtils.toggleInlineStyle(editorState, style))
  }

  toggleBlock = (block) => {
    const { editorState } = this.state
    const { hasFeatures, onChangeSectionAction, section } = this.props
    const isBlockquote = block === 'blockquote'
    const hasBlockquote = clone(section.body).includes('<blockquote>')

    if (!hasFeatures && isBlockquote) {
      return 'handled'
    }

    if (hasFeatures && isBlockquote) {
      if (hasBlockquote) {
        onChangeSectionAction('layout', null)
      } else {
        return this.toggleBlockQuote()
      }
    }
    this.onChange(RichUtils.toggleBlockType(editorState, block))
    this.setState({ showMenu: false })
    return 'handled'
  }

  toggleBlockQuote = () => {
    const {
      article,
      hasFeatures,
      index,
      onChangeSectionAction,
      onSetEditing,
      newSectionAction
    } = this.props
    const { editorState } = this.state

    // Generate new state and html with blockquote
    const newEditorState = RichUtils.toggleBlockType(editorState, 'blockquote')
    const convertedHtml = convertToRichHtml(newEditorState, article.layout, hasFeatures)
    // Get html of blockquote and before/after blocks if existing
    const {
      afterBlock,
      beforeBlock,
      blockquote,
      increment
    } = Strip.makeBlockQuote(convertedHtml)
    // Setup new editorState with only blockquote html
    const editorContent = convertFromRichHtml(blockquote)
    const stateWithBlockquote = EditorState.createWithContent(
      editorContent,
      Config.composedDecorator(article.layout)
    )
    this.onChange(stateWithBlockquote)
    onChangeSectionAction('layout', 'blockquote')
    // Add new blocks before/after if applicable
    if (afterBlock) {
      newSectionAction('text', index + 1, {body: afterBlock})
    }
    if (beforeBlock) {
      newSectionAction('text', index, {body: beforeBlock})
    }
    // Reset focus to block with blockquote
    onSetEditing(index + increment)
  }

  // LINKS
  promptForLink = (isArtist) => {
    const { editorState } = this.state
    const { className, url } = Selection.getSelectedLinkData(editorState)
    const hasPlugin = className && className.includes('is-follow-link')
    const plugin = hasPlugin || isArtist ? 'artist' : undefined

    if (this.domEditor && Selection.hasSelection(editorState)) {
      const selectionTarget = Selection.getLinkSelectionTarget(this.domEditor, editorState)

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
    const editorStateWithLink = Selection.addLinkToState(editorState, url, plugin)

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

    const state = {
      editorState,
      plugin: null,
      showUrlInput: false,
      url: ''
    }
    if (!selection.isCollapsed()) {
      state.editorState = RichUtils.toggleLink(editorState, selection, null)
    }
    this.setState(state)
  }

  // TEXT SELECTION
  checkSelection = () => {
    const { hasFeatures } = this.props
    const { editorState, showUrlInput } = this.state

    if (this.domEditor && !showUrlInput) {
      const selectionTarget = Selection.getMenuSelectionTarget(this.domEditor, editorState, hasFeatures)
      let showMenu = false

      if (selectionTarget) {
        showMenu = true
      }
      this.setState({ selectionTarget, showMenu })
    }
  }

  render () {
    const { article, hasFeatures } = this.props
    const {
      editorState,
      selectionTarget,
      showMenu,
      showUrlInput,
      plugin,
      url
    } = this.state
    const {
      blocks,
      blockMap,
      styles,
      decorators
    } = Config.getRichElements(article.layout, hasFeatures)
    const editing = this.isEditing()
    const showDropCaps = editing ? false : this.isContentStart()

    return (
    <div
      className='SectionText'
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
          className='SectionText__input'
          onMouseUp={this.checkSelection}
          onKeyUp={this.checkSelection}
        >
          <Editor
            ref={(ref) => { this.domEditor = ref }}
            blockRenderMap={blockMap}
            decorators={decorators}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            handlePastedText={this.onPaste}
            handleReturn={this.handleReturn}
            keyBindingFn={KeyBindings.keyBindingFnFull}
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
            onClickOff={() => this.setState({showUrlInput: false})}
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

const mapStateToProps = (state) => ({
  article: state.edit.article,
  hasFeatures: state.app.channel.type !== 'partner',
  sectionIndex: state.edit.sectionIndex
})

const mapDispatchToProps = {
  onChangeSectionAction: onChangeSection,
  newSectionAction: newSection,
  removeSectionAction: removeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionText)
