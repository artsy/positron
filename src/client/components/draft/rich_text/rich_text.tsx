import { DraftHandleValue, Editor, EditorState, RichUtils } from "draft-js"
import { debounce } from "lodash"
import React, { Component } from "react"
import ReactDOM from "react-dom"
import styled from "styled-components"
import { TextInputUrl } from "../components/text_input_url"
import { TextNav } from "../components/text_nav"
import { decorators } from "../shared/decorators"
import { confirmLink, linkDataFromSelection, removeLink } from "../shared/links"
import { getSelectionDetails } from "../shared/selection"
import {
  blockNamesFromMap,
  handleReturn,
  insertPastedState,
  styleMapFromNodes,
  styleNamesFromMap,
} from "../shared/shared"
import { BlockElement, StyleElements, StyleMap } from "../typings"
import { convertDraftToHtml, convertHtmlToDraft } from "./utils/convert"
import {
  blockMapFromNodes,
  keyBindingFn,
  makePlainText,
  richTextBlockElements,
  richTextStyleElements,
} from "./utils/utils"

/**
 * Supports HTML with configurable blocks and styles.
 * Allowed styles can be limited by passing allowedStyles array .
 * Allowed blocks determined by passing an immutable blockRenderMap.
 * Optionally supports links and follow buttons.
 */
interface Props {
  allowedBlocks?: BlockElement[]
  allowedStyles?: StyleElements[]
  editIndex?: number | null
  html?: string
  hasLinks: boolean
  hasFollowButton?: boolean
  isDark?: boolean
  isReadonly?: boolean
  onChange: (html: string) => void
  onHandleBackspace: () => void
  onHandleBlockQuote?: (html: string) => void
  onHandleFocus?: () => void
  onHandleReturn?: (editorState: EditorState) => void
  onHandleTab: (e: any) => void
  placeholder?: string
}

interface State {
  editorState: EditorState
  html: string
  editorPosition: ClientRect | null
  showNav: boolean
  showUrlInput: boolean
  urlValue: string
  urlIsFollow: boolean
}

export class RichText extends Component<Props, State> {
  private editor
  private allowedBlocks: any
  private allowedStyles: StyleMap
  private debouncedOnChange

  static defaultProps = {
    hasFollowButton: false,
    hasLinks: false,
  }

  constructor(props: Props) {
    super(props)
    this.allowedStyles = styleMapFromNodes(
      props.allowedStyles || richTextStyleElements
    )
    this.allowedBlocks = blockMapFromNodes(
      props.allowedBlocks || richTextBlockElements
    )

    this.state = {
      editorState: this.setEditorState(),
      editorPosition: null,
      html: props.html || "",
      showNav: false,
      showUrlInput: false,
      urlValue: "",
      urlIsFollow: false,
    }

    this.debouncedOnChange = debounce(html => {
      props.onChange(html)
    }, 150)
  }

  setEditorState = () => {
    const { hasLinks, html } = this.props

    if (html) {
      return this.editorStateFromHTML(html)
    } else {
      return EditorState.createEmpty(decorators(hasLinks))
    }
  }

  editorStateToHTML = (editorState: EditorState) => {
    const { hasFollowButton } = this.props
    const currentContent = editorState.getCurrentContent()

    return convertDraftToHtml(
      currentContent,
      this.allowedBlocks,
      this.allowedStyles,
      hasFollowButton
    )
  }

  editorStateFromHTML = (html: string) => {
    const { hasLinks } = this.props

    const contentBlocks = convertHtmlToDraft(
      html,
      hasLinks,
      this.allowedBlocks,
      this.allowedStyles
    )
    return EditorState.createWithContent(contentBlocks, decorators(hasLinks))
  }

  onChange = (editorState: EditorState) => {
    const { isReadonly } = this.props
    const html = this.editorStateToHTML(editorState)

    this.setState({ editorState, html })
    if (html !== this.props.html && !isReadonly) {
      // Return html if changed
      this.debouncedOnChange(html)
    }
  }

  focus = () => {
    const { isReadonly } = this.props
    if (!isReadonly) {
      this.editor.focus()
    }
    this.checkSelection()
  }

  blur = () => {
    this.editor.blur()
  }

  resetEditorState = () => {
    setTimeout(() => {
      // why setTimeout i dont know!!
      const editorState = this.setEditorState()
      this.onChange(editorState)
    }, 1)
  }

  componentWillReceiveProps = nextProps => {
    const { isReadonly, editIndex, html } = this.props

    // Update if editor is divided/merged/changed position
    const listPositionHasChanged = editIndex !== nextProps.editIndex
    const bodyHasChanged = html && isReadonly && html !== nextProps.html
    if (listPositionHasChanged || bodyHasChanged) {
      this.resetEditorState()
    }

    // Focus or blur when tabbing in/out
    const readOnlyHasChanged = isReadonly !== nextProps.isReadonly
    if (readOnlyHasChanged) {
      if (!nextProps.isReadonly) {
        this.focus()
      } else {
        this.blur()
      }
    }
  }

  /**
   * Optionally call props.onHandleTab if present
   */
  handleTab = e => {
    const { onHandleTab } = this.props

    if (onHandleTab) {
      onHandleTab(e)
    }
  }

  /**
   * Optionally call props.onHandleBackspace if
   * calling backspace from beginning of editor
   */
  handleBackspace = () => {
    const { editorState } = this.state
    const { onHandleBackspace } = this.props
    const { anchorOffset, isFirstBlock } = getSelectionDetails(editorState)
    const textIsSelected = editorState.getSelection().getAnchorOffset() > 0
    const isStartOfBlock = !anchorOffset && isFirstBlock

    if (onHandleBackspace && isStartOfBlock && !textIsSelected) {
      this.blur()
      onHandleBackspace()
      return "handled" as DraftHandleValue
    } else {
      return "not-handled" as DraftHandleValue
    }
  }

  /**
   * Optionally call props.onHandleReturn if
   * return-ley handling is not allowed
   */
  handleReturn = e => {
    const { editorState } = this.state
    const { onHandleReturn } = this.props
    const handledValue = handleReturn(e, editorState)

    if (onHandleReturn && handledValue === "handled") {
      onHandleReturn(editorState)
      return handledValue
    }
    return "not-handled" as DraftHandleValue
  }

  /**
   * Route a key-command to expected outcome
   */
  handleKeyCommand = command => {
    const { hasLinks } = this.props

    switch (command) {
      case "backspace": {
        return this.handleBackspace()
      }
      case "link-prompt": {
        if (hasLinks) {
          // Open link input if links are supported
          return this.promptForLink()
        }
        break
      }
      case "blockquote":
      case "header-one":
      case "header-two":
      case "header-three": {
        return this.keyCommandBlockType(command)
      }
      case "bold":
      case "italic":
      case "underline": {
        return this.keyCommandInlineStyle(command)
      }
      case "strikethrough": {
        // Not handled by draft's handleKeyCommand, use toggleBlockType instead
        this.toggleInlineStyle(command)
        return "handled" as DraftHandleValue
      }
      case "plain-text": {
        this.makePlainText()
        return "handled" as DraftHandleValue
      }
    }
    // let draft defaults or browser handle
    return "not-handled" as DraftHandleValue
  }

  /**
   * Handle block changes from key command
   */
  keyCommandBlockType = (command: string) => {
    const { onHandleBlockQuote } = this.props
    const { editorState } = this.state
    const blocks = blockNamesFromMap(this.allowedBlocks)

    if (blocks.includes(command)) {
      const newState = RichUtils.toggleBlockType(editorState, command)

      // If an updated state is returned, command is handled
      if (newState) {
        if (command === "blockquote" && onHandleBlockQuote) {
          const html = this.editorStateToHTML(newState)
          if (html.includes("<blockquote>")) {
            onHandleBlockQuote(html)
          }
        }
        this.onChange(newState)
      }
      return "handled"
    } else {
      return "not-handled"
    }
  }

  /**
   * Handle block type changes from menu click
   */
  toggleBlockType = (command: string) => {
    const { editorState } = this.state
    const { onHandleBlockQuote } = this.props
    const blocks = blockNamesFromMap(this.allowedBlocks)
    let newState

    if (blocks.includes(command)) {
      newState = RichUtils.toggleBlockType(editorState, command)
    }
    if (newState) {
      this.onChange(newState)
      if (command === "blockquote" && onHandleBlockQuote) {
        const html = this.editorStateToHTML(newState)
        if (html.includes("<blockquote>")) {
          return onHandleBlockQuote(html)
        }
      }
    }
  }

  /**
   * Handle style changes from key command
   */
  keyCommandInlineStyle = (command: string) => {
    const { editorState } = this.state
    const styles = styleNamesFromMap(this.allowedStyles)

    if (styles.includes(command.toUpperCase())) {
      const newState = RichUtils.handleKeyCommand(editorState, command)
      // If an updated state is returned, command is handled
      if (newState) {
        this.onChange(newState)
        return "handled"
      }
    } else {
      return "not-handled"
    }
  }

  /**
   * Handle style changes from menu click
   */
  toggleInlineStyle = (command: string) => {
    const { editorState } = this.state
    const styles = styleNamesFromMap(this.allowedStyles)
    let newState

    if (styles.includes(command.toUpperCase())) {
      newState = RichUtils.toggleInlineStyle(editorState, command.toUpperCase())
    }
    if (newState) {
      this.onChange(newState)
    }
  }

  /**
   * Remove links/blocks/styles
   */
  makePlainText = () => {
    const { editorState } = this.state
    const newState = makePlainText(editorState)

    this.onChange(newState)
  }

  /**
   * Merge an existing editorState with pasted html
   */
  handlePastedText = (text: string, html?: string) => {
    const { editorState } = this.state

    if (!html) {
      // Wrap pasted plain text in html
      html = "<div>" + text + "</div>"
    }
    const stateFromPastedFragment = this.editorStateFromHTML(html)
    const stateWithPastedText = insertPastedState(
      stateFromPastedFragment,
      editorState
    )

    this.onChange(stateWithPastedText)
    return true
  }

  /**
   * Open a dialog for editing links
   * Optionally open dialog for artist FollowButton links
   * Populates with selection link data if present
   */
  promptForLink = (urlIsFollow: boolean = false) => {
    const { editorState } = this.state
    const linkData = linkDataFromSelection(editorState)
    const urlValue = linkData ? linkData.url : ""
    const editor = ReactDOM.findDOMNode(this.editor) as Element
    const editorPosition: ClientRect = editor.getBoundingClientRect()

    this.setState({
      editorPosition,
      showUrlInput: true,
      showNav: false,
      urlValue,
      urlIsFollow,
    })
    return "handled"
  }

  /**
   * Called when closing link dialog
   * adds a link to selected text and closes popups
   */
  confirmLink = (url: string, urlIsFollow: boolean = false) => {
    const { editorState } = this.state
    const newEditorState = confirmLink(url, editorState, urlIsFollow)

    this.setState({
      showNav: false,
      showUrlInput: false,
      urlValue: "",
      urlIsFollow: false,
    })
    this.onChange(newEditorState)
  }

  /**
   * Called from closing link dialog
   * Removes a link to selected text and closes popups
   */
  removeLink = () => {
    const editorState = removeLink(this.state.editorState)

    if (editorState) {
      this.setState({
        showUrlInput: false,
        urlValue: "",
      })
      this.onChange(editorState)
    }
  }

  /**
   * When changing focus, check to see if a block of text is selected
   * If selection is present, open popup menu
   */
  checkSelection = () => {
    let editorPosition: ClientRect | null = null
    let showNav = false
    const hasSelection = !window.getSelection().isCollapsed

    if (hasSelection) {
      showNav = true
      const editor = ReactDOM.findDOMNode(this.editor) as Element
      editorPosition = editor.getBoundingClientRect()
    }
    this.setState({ editorPosition, showNav })
  }

  onFocus = () => {
    const { isReadonly } = this.props
    // Editor has focused, call setSection
    if (isReadonly) {
      return "handled"
    }
  }

  render() {
    const { hasFollowButton, hasLinks, isDark, placeholder } = this.props
    const {
      editorState,
      editorPosition,
      showNav,
      showUrlInput,
      urlIsFollow,
      urlValue,
    } = this.state
    const promptForLink = hasLinks ? this.promptForLink : undefined

    return (
      <RichTextContainer onDragEnd={this.resetEditorState} onBlur={this.blur}>
        {showNav && (
          <TextNav
            allowedBlocks={this.allowedBlocks}
            allowedStyles={this.allowedStyles}
            editorPosition={editorPosition}
            hasFollowButton={hasFollowButton}
            onClickOff={() => this.setState({ showNav: false })}
            promptForLink={promptForLink}
            toggleBlock={this.toggleBlockType}
            togglePlainText={this.makePlainText}
            toggleStyle={this.toggleInlineStyle}
          />
        )}
        {showUrlInput && (
          <TextInputUrl
            backgroundColor={isDark ? "white" : undefined}
            editorPosition={editorPosition}
            isFollowLink={urlIsFollow}
            onClickOff={() => this.setState({ showUrlInput: false })}
            onConfirmLink={this.confirmLink}
            onRemoveLink={this.removeLink}
            urlValue={urlValue}
          />
        )}
        <div
          onClick={this.focus}
          onMouseUp={this.checkSelection}
          onMouseDown={this.checkSelection}
          onKeyUp={this.checkSelection}
        >
          <Editor
            blockRenderMap={this.allowedBlocks as any}
            editorState={editorState}
            keyBindingFn={keyBindingFn}
            handleKeyCommand={this.handleKeyCommand as any}
            handlePastedText={this.handlePastedText as any}
            handleReturn={this.handleReturn}
            onFocus={this.onFocus.bind(this)}
            onTab={this.handleTab}
            onChange={this.onChange}
            placeholder={placeholder}
            ref={ref => {
              this.editor = ref
            }}
            spellCheck
          />
        </div>
      </RichTextContainer>
    )
  }
}

const RichTextContainer = styled.div`
  position: relative;
`
