import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { last } from 'lodash'

export class InputArtworkUrl extends Component {
  static propTypes = {
    addArtwork: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    fetchArtwork: PropTypes.func.isRequired
  }

  state = {
    isLoading: false,
    url: ''
  }

  getIdFromSlug = (url) => {
    const id = last(url.split('/'))

    if (id.length) {
      this.setState({ isLoading: true })
      this.addArtwork(id)
    }
  }

  addArtwork = async (id) => {
    const { addArtwork, fetchArtwork } = this.props
    let isLoading = false

    try {
      const artwork = await fetchArtwork(id)
      addArtwork(artwork)
      this.setState({ isLoading, url: '' })
    } catch (error) {
      this.setState({ isLoading })
    }
  }

  render () {
    const { disabled } = this.props
    const { isLoading, url } = this.state

    return (
      <div className='InputArtworkUrl'>
        <input
          className='bordered-input bordered-input-dark'
          disabled={disabled}
          placeholder='Add artwork url'
          value={url}
          onChange={(e) => this.setState({ url: e.target.value })}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              this.getIdFromSlug(url)
            }
          }}
        />
        <button
          className={`avant-garde-button ${isLoading ? 'is-loading' : ''}`}
          onClick={() => this.getIdFromSlug(url)}
        >
          Add
        </button>
      </div>
    )
  }
}
