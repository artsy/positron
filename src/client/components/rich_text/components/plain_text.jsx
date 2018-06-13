import { debounce } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { ContentState, Editor, EditorState } from 'draft-js'

export class PlainText extends React.Component {
  static propTypes = {
    content: PropTypes.string,
    name: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string
  }

  constructor (props) {
    super(props)

    const editorState = this.setEditorState()
    this.state = { editorState }
    this.debouncedOnContentChange = debounce((content) => {
      this.onContentChange(content)
    }, 250)
  }

  setEditorState () {
    if (this.props.content) {
      return this.setStateWithContent()
    } else {
      return EditorState.createEmpty()
    }
  }

  setStateWithContent () {
    const content = ContentState.createFromText(this.props.content)
    return EditorState.createWithContent(content)
  }

  onChange = (editorState) => {
    const currentContentState = this.state.editorState.getCurrentContent()
    const newContentState = editorState.getCurrentContent()
    let newContent = editorState.getCurrentContent().getPlainText()

    if (currentContentState !== newContentState) {
      // There was a change in the content
      this.debouncedOnContentChange(newContent)
    }
    this.setState({ editorState })
  }

  onContentChange = (content) => {
    if (this.props.name) {
      this.props.onChange(this.props.name, content)
    } else {
      this.props.onChange(content)
    }
  }

  focus = () => {
    this.refs.editor.focus()
  }

  handleReturn = (e) => {
    return 'handled'
  }

  render () {
    return (
      <div
        className='plain-text'
        name={this.props.name}
        onClick={this.focus}
      >
        <Editor
          ref='editor'
          editorState={this.state.editorState}
          placeholder={this.props.placeholder || 'Start Typing...'}
          handleReturn={this.handleReturn}
          onChange={this.onChange}
          spellcheck
        />
      </div>
    )
  }
}
