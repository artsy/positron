import { debounce } from "lodash"
import PropTypes from "prop-types"
import React from "react"
import { ContentState, Editor, EditorState } from "draft-js"

export class PlainText extends React.Component {
  static editor
  static propTypes = {
    content: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
  }

  constructor(props) {
    super(props)

    const editorState = this.setEditorState()
    this.state = { editorState }
    this.debouncedOnContentChange = debounce(content => {
      this.onContentChange(content)
    }, 250)
  }

  setEditorState() {
    if (this.props.content) {
      return this.setStateWithContent()
    } else {
      return EditorState.createEmpty()
    }
  }

  setStateWithContent() {
    const content = ContentState.createFromText(this.props.content)
    return EditorState.createWithContent(content)
  }

  onChange = editorState => {
    const currentContentState = this.state.editorState.getCurrentContent()
    const newContentState = editorState.getCurrentContent()
    let newContent = editorState.getCurrentContent().getPlainText()

    if (currentContentState !== newContentState) {
      // There was a change in the content
      this.debouncedOnContentChange(newContent)
    }
    this.setState({ editorState })
  }

  onContentChange = content => {
    const { name, onChange } = this.props

    if (name) {
      onChange(name, content)
    } else {
      onChange(content)
    }
  }

  focus = () => {
    this.editor.focus()
  }

  handleReturn = e => {
    return "handled"
  }

  render() {
    const { name, placeholder } = this.props
    const { editorState } = this.state

    return (
      <div className="plain-text" name={name} onClick={this.focus}>
        <Editor
          editorState={editorState}
          handleReturn={this.handleReturn}
          onChange={this.onChange}
          placeholder={placeholder || "Start Typing..."}
          ref={ref => {
            this.editor = ref
          }}
          spellcheck
        />
      </div>
    )
  }
}
