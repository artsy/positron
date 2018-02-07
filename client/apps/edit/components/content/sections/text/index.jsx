import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Editor, EditorState, RichUtils } from 'draft-js'
import { Text } from '@artsy/reaction-force/dist/Components/Publishing'
import * as KeyBindings from 'client/components/rich_text/utils/keybindings'
import * as Selection from 'client/components/rich_text/utils/text_selection'
import * as Strip from 'client/components/rich_text/utils/text_stripping'
import * as Config from './draft_config'
import { convertToRichHtml } from 'client/components/rich_text/utils/convert_html'
import { setContentEnd } from 'client/components/rich_text/utils/decorators'
import { TextInputUrl } from 'client/components/rich_text/components/input_url'
import { TextNav } from 'client/components/rich_text/components/text_nav'

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
      html: null,
      selectionTarget: null,
      showMenu: false,
      showUrlInput: false,
      plugin: null,
      url: null
    }

    props.sections.on('change:autolink', this.setEditorStateFromProps)
  }

  componentWillMount = () => {
    const { editing, section } = this.props

    if (section.body && section.body.length) {
      this.setEditorStateFromProps()
    } else if (editing) {
      this.focus()
    }
  }

  componentDidUpdate = (prevProps) => {
    const {
      article,
      editing,
      isContentEnd,
      onChange,
      section
    } = this.props

    // Reset contentEnd markers if end has changed
    if (isContentEnd !== prevProps.isContentEnd) {
      if (article.layout !== 'classic') {
        const html = setContentEnd(section.body, isContentEnd)
        onChange('body', html)
      }
    }
    // Focus/blur editor if editing prop has changed
    // For change of section via key commands (handleTab, splitSection)
    if (editing && editing !== prevProps.editing) {
      this.focus()
    } else if (!editing && editing !== prevProps.editing) {
      if (this.domEditor) {
        this.domEditor.blur()
      }
    }
  }

  // EDITOR AND CONTENT STATE
  setEditorStateFromProps = () => {
    const { editorState, html } = Config.setEditorStateFromProps(this.props)
    this.setState({ editorState, html })
  }

  onChange = (editorState) => {
    const { article, hasFeatures, onChange, section } = this.props
    const html = convertToRichHtml(editorState, article.layout, hasFeatures)

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

  maybeSplitSection = (anchorKey) => {
    // Called on return
    const { editorState } = this.state
    const { article, index, sections } = this.props

    const hasDividedState = Selection.divideEditorState(editorState, anchorKey, article.layout)
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
    // Maybe merge sections
    const { editorState, html } = this.state
    const { index, onSetEditing, sections } = this.props

    const beforeIndex = index - 1
    const sectionBefore = sections.models[beforeIndex]
    const newState = KeyBindings.handleBackspace(editorState, html, sectionBefore.attributes)

    if (newState) {
      sectionBefore.destroy()
      this.onChange(newState)
      onSetEditing(beforeIndex)
      return 'handled'
    }
    return 'not-handled'
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
    } //else {
    this.onChange(RichUtils.toggleInlineStyle(editorState, style))
    // }
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
      onChange,
      onSetEditing,
      section,
      sections
    } = this.props
    const {
      afterBlock,
      beforeBlock,
      blockquote,
      increment
    } = Strip.makeBlockQuote(section.body)

    if (afterBlock) {
      // TODO: redux newSectionAction
      sections.add({type: 'text', body: afterBlock}, { at: index + 1 })
    }
    if (beforeBlock) {
      // TODO: redux newSectionAction
      sections.add({type: 'text', body: beforeBlock}, { at: index })
    }
    onChange('body', blockquote)
    onChange('layout', 'blockquote')
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
    const {
      blocks,
      blockMap,
      styles,
      decorators
    } = Config.getRichElements(article.layout, hasFeatures)
    const showDropCaps = editing ? false : isContentStart

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
