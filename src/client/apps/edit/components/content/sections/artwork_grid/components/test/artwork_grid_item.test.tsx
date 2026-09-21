import { RemoveButton } from "client/components/remove_button"
import { ArtworkGridArtwork } from "client/typings/sections"
import { mount } from "enzyme"
import React from "react"
import { ArtworkGridItem, getArtistName } from "../artwork_grid_item"

describe("ArtworkGridItem", () => {
  let artwork: ArtworkGridArtwork
  let props

  const getWrapper = (passedProps = props) => {
    return mount(<ArtworkGridItem {...passedProps} />)
  }

  beforeEach(() => {
    artwork = {
      type: "artwork",
      id: "5c9d3c1aa4ba105ad8336957",
      slug: "andy-warhol-soup",
      title: "Soup",
      date: "1962",
      image: "http://image.png",
      partner: { name: "Gagosian", slug: "gagosian" },
      artists: [{ name: "Andy Warhol", slug: "andy-warhol" }],
      artist: { name: "Andy Warhol", slug: "andy-warhol" },
    }
    props = {
      artwork,
      editing: false,
      onRemove: jest.fn(),
    }
  })

  it("renders the image, artist, title, date and partner", () => {
    const component = getWrapper()
    const text = component.text()

    expect(component.find("img").prop("src")).toBe("http://image.png")
    expect(text).toContain("Andy Warhol")
    expect(text).toContain("Soup, 1962")
    expect(text).toContain("Gagosian")
  })

  it("renders a placeholder when there is no image", () => {
    props.artwork = { ...artwork, image: null }
    const component = getWrapper()

    expect(component.find("img").exists()).toBe(false)
  })

  it("does not render a remove button unless editing", () => {
    const component = getWrapper()

    expect(component.find(RemoveButton).exists()).toBe(false)
  })

  it("calls onRemove when editing and the remove button is clicked", () => {
    props.editing = true
    const component = getWrapper()
    component.find(RemoveButton).simulate("click")

    expect(props.onRemove).toBeCalled()
  })

  describe("#getArtistName", () => {
    it("prefers artist, then the first of artists", () => {
      expect(getArtistName(artwork)).toBe("Andy Warhol")
      expect(
        getArtistName({
          ...artwork,
          artist: undefined,
          artists: [{ name: "Jasper Johns" }],
        })
      ).toBe("Jasper Johns")
      expect(
        getArtistName({ ...artwork, artist: undefined, artists: [] })
      ).toBeUndefined()
    })
  })
})
