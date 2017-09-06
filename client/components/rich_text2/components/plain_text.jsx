import React from 'react'
import ReactDOM from 'react-dom'
import { ContentState, Editor, EditorState } from 'draft-js'

export default class PlainText extends React.Component {
  constructor(props) {
    super(props)

    const editorState = this.setEditorState()
    this.state = { editorState }
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

  onChange = (editorState) => {
    this.setState({ editorState })
    const content = editorState.getCurrentContent().getPlainText()
    this.props.onChange(this.props.name, content)
  }

  focus = () => {
    this.refs.editor.focus()
  }

  handleReturn = (e) => {
    return 'handled'
  }

  render() {
    return (
      <div
        className='plain-text'
        name={this.props.name}
        onClick={this.focus}>
        <Editor
          ref='editor'
          editorState={this.state.editorState}
          placeholder={this.props.placeholder || 'Start Typing...'}
          handleReturn={this.handleReturn}
          onChange={this.onChange}
          spellcheck={true} />
      </div>
    )
  }
}
