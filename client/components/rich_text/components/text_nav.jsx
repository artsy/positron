import PropTypes from 'prop-types'
import React from 'react'
import { flatten, map } from 'lodash'
import {
  IconArtist,
  IconBlockquote,
  IconClearFormatting,
  IconLink,
  IconOrderedList,
  IconUnorderedList
} from '@artsy/reaction-force/dist/Components/Publishing'

export class TextNav extends React.Component {
  onToggle = (e, action) => {
    e.preventDefault()

    const {
      blocks,
      makePlainText,
      promptForLink,
      styles,
      toggleBlock,
      toggleStyle
    } = this.props

    if (map(blocks, 'name').includes(action)) {
      return toggleBlock(action)
    }
    if (map(styles, 'name').includes(action)) {
      return toggleStyle(action)
    }

    switch (action) {
      case 'artist': {
        return promptForLink(action)
      }
      case 'link': {
        return promptForLink()
      }
      case 'remove-formatting': {
        return makePlainText()
      }
    }
  }

  getButtonArray () {
    const {
      blocks,
      hasFeatures,
      makePlainText,
      promptForLink,
      styles
    } = this.props
    const buttons = []

    if (styles) {
      buttons.push(styles)
    }
    if (blocks) {
      buttons.push(blocks)
    }
    if (promptForLink) {
      buttons.push({ name: 'link' })
    }
    if (hasFeatures) {
      buttons.push({ name: 'artist' })
    }
    if (makePlainText) {
      buttons.push({ name: 'remove-formatting' })
    }

    return flatten(buttons)
  }

  getIcon (type) {
    const props = { color: '#999' }

    switch (type) {
      case 'artist': {
        return <IconArtist {...props} />
      }
      case 'blockquote' : {
        return <IconBlockquote {...props} />
      }
      case 'link': {
        return <IconLink {...props} />
      }
      case 'ordered-list-item': {
        return <IconOrderedList {...props} />
      }
      case 'remove-formatting': {
        return <IconClearFormatting {...props} />
      }
      case 'unordered-list-item': {
        return <IconUnorderedList {...props} />
      }
    }
  }

  render () {
    const { top, left } = this.props.position
    const buttons = this.getButtonArray()

    return (
      <div
        className='TextNav'
        style={{
          top: top,
          marginLeft: left,
          width: buttons.length > 8 ? '250px' : '200px'
        }}
      >
        {buttons.map((button, i) =>
          <button
            key={i}
            className={button.name.toLowerCase()}
            onMouseDown={(e) => this.onToggle(e, button.name)}
          >
            {button.label
              ? button.label
              : this.getIcon(button.name)
            }
          </button>
        )}
      </div>
    )
  }
}

TextNav.propTypes = {
  blocks: PropTypes.array,
  hasFeatures: PropTypes.bool,
  makePlainText: PropTypes.func,
  position: PropTypes.object.isRequired,
  promptForLink: PropTypes.func,
  styles: PropTypes.array,
  toggleBlock: PropTypes.func,
  toggleStyle: PropTypes.func.isRequired
}
