import PropTypes from "prop-types"
import React, { Component } from "react"
import { last } from "lodash"
import { Button } from "@artsy/palette"
import styled from "styled-components"

export class InputArtworkUrl extends Component {
  static propTypes = {
    addArtwork: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    fetchArtwork: PropTypes.func.isRequired,
  }

  state = {
    isLoading: false,
    url: "",
  }

  getIdFromSlug = url => {
    const id = last(url.split("/"))

    if (id.length) {
      this.setState({ isLoading: true })
      this.addArtwork(id)
    }
  }

  addArtwork = async id => {
    const { addArtwork, fetchArtwork } = this.props
    let isLoading = false

    try {
      const artwork = await fetchArtwork(id)
      addArtwork(artwork)
      this.setState({ isLoading, url: "" })
    } catch (error) {
      this.setState({ isLoading })
    }
  }

  render() {
    const { disabled } = this.props
    const { isLoading, url } = this.state

    return (
      <InputArtworkUrlContainer>
        <input
          className="bordered-input bordered-input-dark"
          disabled={disabled}
          placeholder="Add artwork url"
          value={url}
          onChange={e => this.setState({ url: e.target.value })}
          onKeyUp={e => {
            if (e.key === "Enter") {
              this.getIdFromSlug(url)
            }
          }}
        />
        <Button
          variant="secondaryGray"
          loading={isLoading}
          borderRadius={0}
          onClick={() => this.getIdFromSlug(url)}
        >
          Add
        </Button>
      </InputArtworkUrlContainer>
    )
  }
}

const InputArtworkUrlContainer = styled.div`
  button {
    height: 40px;
  }
  input {
    width: calc(100% - 75px);
  }
`
