import { Editor, EditorState, RichUtils } from "draft-js"
import { debounce } from "lodash"
import React, { Component } from "react"
import ReactDOM from "react-dom"
import styled from "styled-components"
import { TextInputUrl } from "../components/text_input_url"
import { TextNav } from "../components/text_nav"
import { decorators } from "../shared/decorators"
import { confirmLink, linkDataFromSelection, removeLink } from "../shared/links"
import {
  handleReturn,
  insertPastedState,
  styleMapFromNodes,
  styleNamesFromMap,
} from "../shared/shared"
import { AllowedStyles, StyleMap, StyleNamesParagraph } from "../typings"
import { convertDraftToHtml, convertHtmlToDraft } from "./utils/convert"
import {
  allowedStylesParagraph,
  blockRenderMap,
  keyBindingFn,
} from "./utils/utils"

interface Props {
  allowedStyles?: AllowedStyles
  allowEmptyLines?: boolean // Users can insert br tags
  html?: string
  hasLinks: boolean
  onChange: (html: string) => void
  placeholder?: string
  stripLinebreaks: boolean // Return a single p block
  isDark?: boolean
  isReadOnly?: boolean
}

interface State {
  editorPosition: ClientRect | null
  editorState: EditorState
  html: string
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
    allowEmptyLines: false,
    hasLinks: false,
    stripLinebreaks: false,
  }

  constructor(props: Props) {
    super(props)
    this.allowedStyles = styleMapFromNodes(
      props.allowedStyles || allowedStylesParagraph
    )

    this.state = {
      editorPosition: null,
      editorState: this.setEditorState(),
      html: props.html || "",
      showNav: false,
      showUrlInput: false,
      urlValue: "",
    }

    this.debouncedOnChange = debounce((html: string) => {
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

  editorStateToHTML = (editorState: EditorState) => {
    const { allowEmptyLines, stripLinebreaks } = this.props
    const currentContent = editorState.getCurrentContent()

    return convertDraftToHtml(
      currentContent,
      this.allowedStyles,
      stripLinebreaks,
      allowEmptyLines
    )
  }

  editorStateFromHTML = (html: string) => {
    const { hasLinks, allowEmptyLines } = this.props
    const contentBlocks = convertHtmlToDraft(
      html,
      hasLinks,
      this.allowedStyles,
      allowEmptyLines
    )

    return EditorState.createWithContent(contentBlocks, decorators(hasLinks))
  }

  onChange = (editorState: EditorState) => {
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
    const { stripLinebreaks, allowEmptyLines } = this.props

    if (stripLinebreaks) {
      // Do nothing if linebreaks are disallowed
      return "handled"
    } else if (allowEmptyLines) {
      return "not-handled"
    } else {
      // Maybe split-block, but don't create empty paragraphs
      return handleReturn(e, editorState)
    }
  }

  handleKeyCommand = (command: string) => {
    const { hasLinks } = this.props

    switch (command) {
      case "link-prompt": {
        if (hasLinks) {
          // Open link input if links are supported
          return this.promptForLink()
        }
        break
      }
      case "bold":
      case "italic": {
        return this.keyCommandInlineStyle(command)
      }
    }
    // let draft defaults or browser handle
    return "not-handled"
  }

  keyCommandInlineStyle = (command: "italic" | "bold") => {
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

  toggleInlineStyle = (command: StyleNamesParagraph) => {
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

  handlePastedText = (text: string, html?: string) => {
    const { editorState } = this.state

    if (!html) {
      // Wrap pasted plain text in html
      html = "<p>" + text + "</p>"
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
    const urlValue = linkData ? linkData.url : ""
    const editor = ReactDOM.findDOMNode(this.editor) as Element
    const editorPosition: ClientRect = editor.getBoundingClientRect()

    this.setState({
      editorPosition,
      showUrlInput: true,
      showNav: false,
      urlValue,
    })
    return "handled"
  }

  confirmLink = (url: string) => {
    const { editorState } = this.state
    const newEditorState = confirmLink(url, editorState)

    this.setState({
      editorPosition: null,
      showNav: false,
      showUrlInput: false,
      urlValue: "",
    })
    this.onChange(newEditorState)
  }

  removeLink = () => {
    const editorState = removeLink(this.state.editorState)

    if (editorState) {
      this.setState({
        editorPosition: null,
        showUrlInput: false,
        urlValue: "",
      })
      this.onChange(editorState)
    }
  }

  checkSelection = () => {
    let showNav = false
    let editorPosition: ClientRect | null = null
    const hasSelection = !window.getSelection().isCollapsed

    if (hasSelection) {
      showNav = true
      const editor = ReactDOM.findDOMNode(this.editor) as Element
      editorPosition = editor.getBoundingClientRect()
    }
    this.setState({ showNav, editorPosition })
  }

  render() {
    const { hasLinks, isDark, isReadOnly, placeholder } = this.props
    const {
      editorPosition,
      editorState,
      showNav,
      showUrlInput,
      urlValue,
    } = this.state
    const promptForLink = hasLinks ? this.promptForLink : undefined

    return (
      <ParagraphContainer>
        {showNav && (
          <TextNav
            allowedStyles={this.allowedStyles}
            editorPosition={editorPosition}
            onClickOff={() => this.setState({ showNav: false })}
            promptForLink={promptForLink}
            toggleStyle={this.toggleInlineStyle}
          />
        )}
        {showUrlInput && (
          <TextInputUrl
            backgroundColor={isDark ? "white" : undefined}
            editorPosition={editorPosition}
            onClickOff={() => this.setState({ showUrlInput: false })}
            onConfirmLink={this.confirmLink}
            onRemoveLink={this.removeLink}
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
            placeholder={placeholder || "Start typing..."}
            readOnly={isReadOnly}
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
