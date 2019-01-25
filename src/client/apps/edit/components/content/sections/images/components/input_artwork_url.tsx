import { Button, Flex } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { last } from "lodash"
import React, { Component } from "react"
import styled from "styled-components"

interface InputArtworkUrlProps {
  addArtwork: (artwork: any) => void
  disabled: boolean
  fetchArtwork: (id: string) => void
}

interface InputArtworkUrlState {
  isLoading: boolean
  url: string
}

export class InputArtworkUrl extends Component<
  InputArtworkUrlProps,
  InputArtworkUrlState
> {
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
    const isLoading = false

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
        <Input
          className="bordered-input bordered-input-dark"
          disabled={disabled}
          placeholder="Add artwork url"
          defaultValue={url}
          onChange={e => this.setState({ url: e.currentTarget.value })}
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

const InputArtworkUrlContainer = styled(Flex)`
  button {
    height: 40px;
  }
  div[class^="Input__Container"] {
    width: calc(100% - 75px);
  }
`
