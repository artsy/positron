import PropTypes from 'prop-types'
import React, { Component } from 'react'
import colors from '@artsy/reaction-force/dist/Assets/Colors'
import { RemoveButton } from 'client/components/remove_button'

export class TextInputUrl extends Component {
  static propTypes = {
    confirmLink: PropTypes.func,
    pluginType: PropTypes.string,
    removeLink: PropTypes.func,
    selectionTarget: PropTypes.object,
    urlValue: PropTypes.string
  }

  state = {
    url: this.props.urlValue || ''
  }

  confirmLink = () => {
    const { url } = this.state
    const {
      confirmLink,
      pluginType,
      removeLink
    } = this.props

    if (url.length) {
      confirmLink(url, pluginType)
    } else {
      removeLink()
    }
  }

  render () {
    const { url } = this.state
    const { removeLink, selectionTarget } = this.props
    const { left, top } = selectionTarget

    return (
      <div
        className='TextInputUrl'
        style={{
          top: top || 0,
          left: left || 0
        }}
      >
        <div className='TextInputUrl__input'>
          <input
            autoFocus
            className='bordered-input'
            value={url}
            onChange={(e) => this.setState({url: e.target.value})}
            placeholder='Paste or type a link'
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                this.confirmLink()
              }
            }}
          />
          {url.length > 0 &&
            <RemoveButton
              onClick={removeLink}
              background={colors.grayMedium}
            />
          }
        </div>

        <button
          className='add-link'
          onClick={this.confirmLink}
        >
          Apply
        </button>
      </div>
    )
  }
}
