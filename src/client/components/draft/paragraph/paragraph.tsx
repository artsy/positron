import { Editor, EditorState, RichUtils } from 'draft-js'
import { debounce } from 'lodash'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { TextInputUrl } from '../../rich_text/components/input_url'
import { TextNav } from '../../rich_text/components/text_nav'
import { stickyControlsBox } from '../../rich_text/utils/text_selection'
import { convertDraftToHtml, convertHtmlToDraft } from './utils/convert'
import { decorators } from './utils/decorators'
import { confirmLink, linkDataFromSelection, removeLink } from './utils/links'
import { AllowedStyles, StyleMap } from './utils/typings'
import {
  blockRenderMap,
  handleReturn,
  insertPastedState,
  keyBindingFn,
  styleMapFromNodes,
  styleNamesFromMap,
} from './utils/utils'

interface Props {
  allowedStyles?: AllowedStyles
  html?: string
  hasLinks: boolean
  onChange: (html: string) => void
  placeholder?: string
  stripLinebreaks: boolean
  isDark?: boolean
}

interface State {
  editorState: EditorState
  html: string
  selectionTarget: any
  showNav: boolean
  showUrlInput: boolean
  urlValue: string
}

/**
 * Supports HTML with bold and italic styles in <p> blocks.
 * Allowed styles can be limited by passing allowedStyles.
 * Optionally supports links, and linebreak stripping.
 */
export class Paragraph extends Component<Props, State> {
  private editor
  private allowedStyles: StyleMap
  private debouncedOnChange
  static defaultProps = {
    hasLinks: false,
    stripLinebreaks: false,
  }

  constructor(props: Props) {
    super(props)
    this.allowedStyles = styleMapFromNodes(props.allowedStyles)

    this.state = {
      editorState: this.setEditorState(),
      html: props.html || '',
      selectionTarget: null,
      showNav: false,
      showUrlInput: false,
      urlValue: '',
    }

    this.debouncedOnChange = debounce(html => {
      props.onChange(html)
    }, 250)
  }

  setEditorState = () => {
    const { hasLinks, html } = this.props

    if (html) {
      return this.editorStateFromHTML(html)
    } else {
      return EditorState.createEmpty(decorators(hasLinks))
    }
  }

  editorStateToHTML = editorState => {
    const { stripLinebreaks } = this.props
    const currentContent = editorState.getCurrentContent()

    return convertDraftToHtml(
      currentContent,
      this.allowedStyles,
      stripLinebreaks
    )
  }

  editorStateFromHTML = html => {
    const { hasLinks } = this.props
    const contentBlocks = convertHtmlToDraft(html, hasLinks, this.allowedStyles)

    return EditorState.createWithContent(contentBlocks, decorators(hasLinks))
  }

  onChange = editorState => {
    const html = this.editorStateToHTML(editorState)

    this.setState({ editorState, html })
    if (html !== this.props.html) {
      // Return html if changed
      this.debouncedOnChange(html)
    }
  }

  focus = () => {
    this.editor.focus()
    this.checkSelection()
  }

  handleReturn = e => {
    const { editorState } = this.state
    const { stripLinebreaks } = this.props

    if (stripLinebreaks) {
      // Do nothing if linebreaks are disallowed
      return 'handled'
    } else {
      // Maybe split-block, but don't create empty paragraphs
      return handleReturn(e, editorState)
    }
  }

  handleKeyCommand = command => {
    const { hasLinks } = this.props

    switch (command) {
      case 'link-prompt': {
        if (hasLinks) {
          // Open link input if links are supported
          return this.promptForLink()
        }
        break
      }
      case 'bold':
      case 'italic': {
        return this.keyCommandInlineStyle(command)
      }
    }
    // let draft defaults or browser handle
    return 'not-handled'
  }

  keyCommandInlineStyle = command => {
    // Handle style changes from key command
    const { editorState } = this.state
    const styles = styleNamesFromMap(this.allowedStyles)

    if (styles.includes(command.toUpperCase())) {
      const newState = RichUtils.handleKeyCommand(editorState, command)

      // If an updated state is returned, command is handled
      if (newState) {
        this.onChange(newState)
        return 'handled'
      }
    } else {
      return 'not-handled'
    }
  }

  toggleInlineStyle = command => {
    // Handle style changes from menu click
    const { editorState } = this.state
    const styles = styleNamesFromMap(this.allowedStyles)
    let newEditorState

    if (styles.includes(command)) {
      newEditorState = RichUtils.toggleInlineStyle(editorState, command)
    }
    if (newEditorState) {
      this.onChange(newEditorState)
    }
  }

  handlePastedText = (text, html) => {
    const { editorState } = this.state

    if (!html) {
      // Wrap pasted plain text in html
      html = '<p>' + text + '</p>'
    }
    const stateFromPastedFragment = this.editorStateFromHTML(html)
    const stateWithPastedText = insertPastedState(
      stateFromPastedFragment,
      editorState
    )

    this.onChange(stateWithPastedText)
    return true
  }

  promptForLink = () => {
    // Opens a popup link input populated with selection data if link is selected
    const { editorState } = this.state
    const linkData = linkDataFromSelection(editorState)
    const urlValue = linkData ? linkData.url : ''
    const editorPosition = ReactDOM.findDOMNode(
      this.editor
    ).getBoundingClientRect()
    // TODO: move position calculation to input component
    const selectionTarget = stickyControlsBox(editorPosition, 25, 200)

    this.setState({
      selectionTarget,
      showUrlInput: true,
      showNav: false,
      urlValue,
    })
    return 'handled'
  }

  confirmLink = url => {
    const { editorState } = this.state
    const newEditorState = confirmLink(url, editorState)

    this.setState({
      selectionTarget: null,
      showNav: false,
      showUrlInput: false,
      urlValue: '',
    })
    this.onChange(newEditorState)
  }

  removeLink = () => {
    const editorState = removeLink(this.state.editorState)

    if (editorState) {
      this.setState({
        showUrlInput: false,
        urlValue: '',
      })
      this.onChange(editorState)
    }
  }

  checkSelection = () => {
    const { hasLinks } = this.props
    let selectionTarget: any = null
    let showNav = false

    const hasSelection = !window.getSelection().isCollapsed
    const stylesLength = this.allowedStyles.length
    const buttonsLength = hasLinks ? stylesLength + 1 : stylesLength
    // TODO: move position calculation to input component
    const buttonWidth = 25
    const menuHeight = -45
    const selectionTargetLeft = buttonsLength * buttonWidth

    if (hasSelection) {
      showNav = true
      const editorPosition = ReactDOM.findDOMNode(
        this.editor
      ).getBoundingClientRect()
      // TODO: Popup component should determine its own size
      selectionTarget = stickyControlsBox(
        editorPosition,
        menuHeight,
        selectionTargetLeft
      )
    }
    this.setState({ showNav, selectionTarget })
  }

  render() {
    const { hasLinks, isDark, placeholder } = this.props
    const {
      editorState,
      selectionTarget,
      showNav,
      showUrlInput,
      urlValue,
    } = this.state
    const promptForLink = hasLinks ? this.promptForLink : undefined

    return (
      <ParagraphContainer>
        {showNav && (
          <TextNav
            onClickOff={() => this.setState({ showNav: false })}
            position={selectionTarget}
            promptForLink={promptForLink}
            styles={this.allowedStyles}
            toggleStyle={this.toggleInlineStyle}
          />
        )}
        {showUrlInput && (
          <TextInputUrl
            backgroundColor={isDark ? 'white' : undefined}
            confirmLink={this.confirmLink}
            onClickOff={() => this.setState({ showUrlInput: false })}
            removeLink={this.removeLink}
            selectionTarget={selectionTarget}
            urlValue={urlValue}
          />
        )}
        <div
          onClick={this.focus}
          onMouseUp={this.checkSelection}
          onKeyUp={this.checkSelection}
        >
          <Editor
            blockRenderMap={blockRenderMap as any}
            editorState={editorState}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={this.handleKeyCommand as any}
            handlePastedText={this.handlePastedText as any}
            handleReturn={this.handleReturn}
            onChange={this.onChange}
            placeholder={placeholder || 'Start typing...'}
            ref={ref => {
              this.editor = ref
            }}
            spellCheck
          />
        </div>
      </ParagraphContainer>
    )
  }
}

const ParagraphContainer = styled.div`
  position: relative;
`
