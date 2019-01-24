import { Input } from "@artsy/reaction/dist/Components/Input"
import { Artworks } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"
import { mount } from "enzyme"
import React from "react"
import { InputArtworkUrl } from "../components/input_artwork_url"

describe("InputArtworkUrl", () => {
  const props = {
    addArtwork: jest.fn(),
    disabled: false,
    fetchArtwork: jest.fn().mockReturnValue(Artworks[0]),
  }

  const artworkUrl = "https://www.artsy.net/artwork/chip-hughes-stripes"

  const getWrapper = (passedProps = props) => {
    return mount(<InputArtworkUrl {...passedProps} />)
  }

  it("Renders input and button", () => {
    const component = getWrapper(props)

    expect(component.find("input").length).toBe(1)
    expect(component.find("button").length).toBe(1)
  })

  it("Input can be disabled with props", () => {
    props.disabled = true
    const component = getWrapper(props)

    expect(
      component
        .find("input")
        .first()
        .getElement().props.disabled
    ).toBe(true)
  })

  it("Sets input value to state.url on change", () => {
    const component = getWrapper(props)
    const input = component
      .find(Input)
      .at(0)
      .instance() as Input
    const event = ({
      currentTarget: {
        value: artworkUrl,
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)
    expect(component.state().url).toBe(artworkUrl)
  })

  it("Calls getIdFromSlug on button click", () => {
    const component = getWrapper(props)
    const instance = component.instance() as InputArtworkUrl
    instance.setState({
      url: artworkUrl,
    })
    const button = component.find("button").first()
    instance.getIdFromSlug = jest.fn()

    button.simulate("click")
    expect(instance.getIdFromSlug).toBeCalledWith(artworkUrl)
  })

  it("Calls getIdFromSlug on enter", () => {
    const component = getWrapper(props)
    const instance = component.instance() as InputArtworkUrl
    instance.setState({
      url: artworkUrl,
    })
    const input = component.find("input").first()
    instance.getIdFromSlug = jest.fn()

    input.simulate("keyup", { key: "Enter" })
    expect(instance.getIdFromSlug).toBeCalledWith(artworkUrl)
  })

  it("#getIdFromSlug returns an id and calls addArtwork", () => {
    const component = getWrapper(props).instance() as InputArtworkUrl
    component.addArtwork = jest.fn()
    component.getIdFromSlug(artworkUrl)

    expect(component.addArtwork).toBeCalledWith("chip-hughes-stripes")
  })

  it("#addArtwork fetches an artwork and calls props.addArtwork", async () => {
    const component = getWrapper(props).instance() as InputArtworkUrl
    await component.getIdFromSlug(artworkUrl)

    expect(props.fetchArtwork.mock.calls[0][0]).toBe("chip-hughes-stripes")
    expect(props.addArtwork.mock.calls[0][0]).toBe(Artworks[0])
  })
})
