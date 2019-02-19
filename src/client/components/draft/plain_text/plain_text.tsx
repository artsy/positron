import { ContentState, DraftHandleValue, Editor, EditorState } from "draft-js"
import { debounce } from "lodash"
import React from "react"
import styled from "styled-components"

interface PlainTextProps {
  content?: string
  onChange: (val: string) => void
  placeholder?: string
}

interface PlainTextState {
  editorState: EditorState
}

export class PlainText extends React.Component<PlainTextProps, PlainTextState> {
  public editor
  private debouncedOnContentChange

  constructor(props) {
    super(props)

    const editorState = this.setEditorState()
    this.state = { editorState }
    this.debouncedOnContentChange = debounce(content => {
      props.onChange(content)
    }, 250)
  }

  setEditorState() {
    const { content } = this.props

    if (content) {
      const contentState = ContentState.createFromText(content)
      return EditorState.createWithContent(contentState)
    } else {
      return EditorState.createEmpty()
    }
  }

  onChange = (editorState: EditorState) => {
    const currentContentState = this.state.editorState.getCurrentContent()
    const newContentState = editorState.getCurrentContent()
    const newContent = editorState.getCurrentContent().getPlainText()

    if (currentContentState !== newContentState) {
      // There was a change in the content
      this.debouncedOnContentChange(newContent)
    }
    this.setState({ editorState })
  }

  focus = () => {
    this.editor.focus()
  }

  handleReturn = (e, _editorState?: EditorState) => {
    e.preventDefault()
    return "handled" as DraftHandleValue
  }

  render() {
    const { placeholder } = this.props
    const { editorState } = this.state

    return (
      <PlainTextContainer onClick={this.focus}>
        <Editor
          editorState={editorState}
          handleReturn={this.handleReturn}
          onChange={this.onChange}
          placeholder={placeholder || "Start Typing..."}
          ref={ref => {
            this.editor = ref
          }}
          spellCheck
        />
      </PlainTextContainer>
    )
  }
}

export const PlainTextContainer = styled.div`
  position: relative;
`
