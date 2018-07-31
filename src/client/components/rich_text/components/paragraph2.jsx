import styled from 'styled-components'
import Immutable from 'immutable'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  convertFromHTML,
  convertToHTML
} from 'draft-convert'
import {
  getDefaultKeyBinding,
  getVisibleSelectionRect,
  Editor,
  EditorState,
  KeyBindingUtil,
  RichUtils
} from 'draft-js'
// import { decorators, getSelectionLinkData } from '../decorators'
import { LinkInput } from '../LinkInput'

// Extends Paragraph editor to use links
export class ParagraphWithLinks extends Component {
  static editor
  static propTypes = {
    html: PropTypes.string,
    onChange: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      editorState: this.setEditorState(),
      html: props.html || '',
      showLinkInput: false,
      navPosition: null
    }
  }

  setEditorState = () => {
    const { html } = this.props

    if (html) {
      return this.editorStateFromHTML(html)
    } else {
      // Initialize editor with link support
      return EditorState.createEmpty(decorators())
    }
  }

  editorStateToHtml = editorState => {
    const currentContent = editorState.getCurrentContent()
    // Tell convertToHTML how to handle links
    return convertToHTML({
      entityToHTML: (entity, originalText) => {
        if (entity.type === 'LINK') {
          const innerText = originalText
          return <a href={entity.data.url}>{innerText}</a>
        }
        return originalText
      }
    })(currentContent)
  }

  editorStateFromHTML = html => {
    // Tell convertFromHTML how to handle links
    const contentBlocks = convertFromHTML({
      htmlToEntity: (nodeName, node, createEntity) => {
        let data
        if (nodeName === 'a') {
          data = { url: node.href }
          return createEntity(
            'LINK',
            'MUTABLE',
            data
          )
        }
      }
    })(html)
    // Create with decorators to support links
    return EditorState.createWithContent(contentBlocks, decorators())
  }

  onChange = editorState => {
    const { onChange } = this.props
    const html = this.editorStateToHtml(editorState)

    this.setState({ editorState, html })
    if (html !== this.props.html) {
      // Return html if changed
      onChange(html)
    }
  }

  focus = () => {
    this.editor.focus()
  }

  handleKeyCommand = command => {
    const { editorState } = this.state
    const hasSelection = !editorState.getSelection().isCollapsed()

    if (command === 'link-prompt' && hasSelection) {
      // Use a key command to create a new link
      this.promptForLink()
    } else {
      const newState = RichUtils.handleKeyCommand(editorState, command)
      // If an updated state is returned, the command is handled

      if (newState) {
        this.onChange(newState)
        return 'handled'
      }
    }
    // Otherwise let the browser handle it
    return 'not-handled'
  }

  checkSelection = () => {
    const { editorState } = this.state
    const hasSelection = !editorState.getSelection().isCollapsed()
    const urlValue = getSelectionLinkData(editorState)

    if (hasSelection && urlValue) {
      // Dont show input unless selection is link
      this.promptForLink()
    } else {
      this.onClickOffLink()
    }
  }

  onClickOffLink = () => {
    this.setState({
      navPosition: null,
      showLinkInput: false,
      urlValue: null
    }, () => {
      setTimeout(() => this.editor.focus(), 5)
    })
  }

  promptForLink = () => {
    const { editorState } = this.state
    const urlValue = getSelectionLinkData(editorState) || ''
    const navPosition = this.getSelectionPosition()

    this.setState({
      showLinkInput: true,
      urlValue,
      navPosition
    })
  }

  getStateWithLink = url => {
    const { editorState } = this.state
    const currentContent = editorState
      .getCurrentContent()
      .createEntity(
        'LINK',
        'MUTABLE',
        { url }
      )
    const entityKey = currentContent.getLastCreatedEntityKey()
    const stateWithEntity = EditorState.set(
      editorState,
      { currentContent }
    )
    const newEditorState = RichUtils.toggleLink(
      stateWithEntity,
      stateWithEntity.getSelection(),
      entityKey
    )

    return newEditorState
  }

  confirmLink = url => {
    const editorState = this.getStateWithLink(url)

    this.setState({
      editorState,
      showLinkInput: false,
      urlValue: ''
    }, () => {
      setTimeout(() => this.editor.focus(), 0)
    })
  }

  getSelectionPosition = () => {
    if (this.editor) {
      const editor = ReactDOM.findDOMNode(this.editor)
      const editorPosition = editor.getBoundingClientRect()
      const target = getVisibleSelectionRect(window)
      const margin = 10 // inner padding of EditorContainer

      const top = (target.top - editorPosition.top) + target.height + margin
      const left = (target.left - editorPosition.left) + (target.width / 2) + margin

      return {
        top,
        left
      }
    }
  }

  render () {
    const {
      editorState,
      html,
      navPosition,
      showLinkInput,
      urlValue
    } = this.state

    return (
      <div style={{position: 'relative'}}>
        {showLinkInput &&
          <LinkInput
            urlValue={urlValue}
            confirmLink={this.confirmLink}
            onClickOff={this.onClickOffLink}
            position={navPosition}
          />
        }
        <EditorContainer
          onKeyUp={this.checkSelection}
          onClick={this.checkSelection}
        >
          <div onClick={this.focus}>
            <Editor
              blockRenderMap={blockRenderMap}
              editorState={editorState}
              handleKeyCommand={this.handleKeyCommand}
              keyBindingFn={keyBindingFn}
              onChange={this.onChange}
              placeholder='Click to start typing...'
              readOnly={showLinkInput}
              ref={(ref) => { this.editor = ref }}
              spellCheck
            />
          </div>
        </EditorContainer>
        <div>
          <p><code>state.html</code>:</p>
          <p>{html}</p>
        </div>
      </div>
    )
  }
}

/*
  blockRenderMap determines which kinds of HTML blocks are
  allowed by the editor. Below, blocks are limited to the
  default 'unstyled', which @editorStateToHtml converts to <p>.

  Blocks are limited below to prevents users from pasting text
  with blocks that the editor's default key commands cannot handle. 

  The element is 'div' because Draft.js nests additional
  <div> tags as children to each block, and <p> tags throw
  a console error if they have <div>'s as children.
*/
const blockRenderMap = Immutable.Map({
  'unstyled': {
    element: 'div'
  }
})

const keyBindingFn = e => {
  // Set key commands available in your editor
  // Can also override browser command defaults
  if (KeyBindingUtil.hasCommandModifier(e)) {
    switch (e.keyCode) {
      case 75:
      // command + k
        return 'link-prompt'
      default:
        // Allows existing commands to return default,
        // you can stop them by returning 'not handled'
        return getDefaultKeyBinding(e)
    }
  }
  // still return default if no modifier
  // so users can type content
  return getDefaultKeyBinding(e)
}

const colors = {
  gray: '#ccc'
}

export const EditorContainer = styled.div`
  border: 1px solid ${colors.gray};
  min-height: 5em;
  padding: 10px;
  position: relative;

  .public-DraftEditorPlaceholder-root {
    color: ${colors.gray};
    position: absolute;
  }

  .public-DraftStyleDefault-block {
    margin-bottom: 1em;
  }
`


export const decorators = () => {
  return new CompositeDecorator([
    {
      strategy: findLinkEntities,
      component: Link,
    }
  ])
}

export const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity()
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      )
    },
    callback
  )
}

const Link = props => {
  const { children, contentState, entityKey } = props
  const { url } = contentState.getEntity(entityKey).getData()
  const onClick = (e) => e.preventDefault()

  return (
    <a href={url} onClick={onClick}>
      {children}
    </a>
  )
}

export const getSelectionLinkData = editorState => {
  const contentState = editorState.getCurrentContent()
  const selection = editorState.getSelection()
  const startKey = selection.getStartKey()
  const startOffset = selection.getStartOffset()
  const blockWithLink = contentState.getBlockForKey(startKey)
  const linkKey = blockWithLink.getEntityAt(startOffset)

  if (linkKey) {
    const entity = contentState.getEntity(linkKey)
    return entity.getData().url
  }
}
