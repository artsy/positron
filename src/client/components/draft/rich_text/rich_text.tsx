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
  onHandleBlockQuote?: (html: string, resetEditorState: () => void) => void
  onHandleReturn?: (
    editorState: EditorState,
    resetEditorState: () => void
  ) => void
  onHandleTab: (e: any, resetEditorState: () => void) => void
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
    this.editor.focus()
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
    // Update if editor has changed position
    const { isReadonly, editIndex, html } = this.props
    const listPositionHasChanged = editIndex !== nextProps.editIndex
    const bodyHasChanged = html && isReadonly && html !== nextProps.html

    const readOnlyHasChanged = isReadonly !== nextProps.isReadonly

    if (listPositionHasChanged || bodyHasChanged) {
      this.resetEditorState()
      if (!isReadonly) {
        this.focus()
      }
    }
    if (readOnlyHasChanged) {
      if (!nextProps.isReadonly) {
        this.focus()
      } else {
        this.blur()
      }
    }
  }

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

  handleReturn = e => {
    const { editorState } = this.state
    const { onHandleReturn } = this.props
    const handledValue = handleReturn(e, editorState)

    if (onHandleReturn && handledValue === "handled") {
      onHandleReturn(editorState, this.resetEditorState)
      return handledValue
    }
    return "not-handled" as DraftHandleValue
  }

  // TODO: handleTab

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

  keyCommandBlockType = (command: string) => {
    // Handle block changes from key command
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
            onHandleBlockQuote(html, this.resetEditorState)
          }
        }
        this.onChange(newState)
      }
      return "handled"
    } else {
      return "not-handled"
    }
  }

  toggleBlockType = (command: string) => {
    // Handle block type changes from menu click
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
          return onHandleBlockQuote(html, this.resetEditorState)
        }
      }
    }
  }

  keyCommandInlineStyle = (command: string) => {
    // Handle style changes from key command
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

  toggleInlineStyle = (command: string) => {
    // Handle style changes from menu click
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

  makePlainText = () => {
    const { editorState } = this.state
    const newState = makePlainText(editorState)

    this.onChange(newState)
  }

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

  promptForLink = (urlIsFollow: boolean = false) => {
    // Opens a popup link input populated with selection data if link is selected
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
            onTab={e => this.props.onHandleTab(e, this.resetEditorState)}
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
