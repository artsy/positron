import styled from 'styled-components'
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

    return (
      <TextInputUrlContainer
        className='TextInputUrl'
        top={selectionTarget.top}
        left={selectionTarget.left}
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
      </TextInputUrlContainer>
    )
  }
}

const TextInputUrlContainer = styled.div`
  top: ${props => `${props.top}px` || 0};
  left: ${props => `${props.left}px` || 0};
`
