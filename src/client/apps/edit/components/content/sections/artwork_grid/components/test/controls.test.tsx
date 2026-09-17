import Backbone from "backbone"
import { SectionControls } from "client/apps/edit/components/content/section_controls"
import { Autocomplete } from "client/components/autocomplete2"
import { ArtworkGridArtwork } from "client/typings/sections"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { InputArtworkUrl } from "../../../images/components/input_artwork_url"
import { ArtworkGridControls, ColumnButton } from "../controls"
require("typeahead.js")

describe("ArtworkGridControls", () => {
  let artworks: ArtworkGridArtwork[]
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: { channel: { type: "editorial" } },
      edit: {
        article: { layout: "standard" },
        section: passedProps.editSection,
        sectionIndex: passedProps.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <section>
          <ArtworkGridControls {...passedProps} />
        </section>
      </Provider>
    )
  }

  const getInstance = (component): ArtworkGridControls => {
    return component.find(ArtworkGridControls).instance()
  }

  beforeEach(() => {
    artworks = ["a", "b"].map(id => ({
      type: "artwork" as const,
      id,
      slug: `slug-${id}`,
    }))
    props = {
      editSection: { type: "artwork_grid", columns: 3, artworks },
      logErrorAction: jest.fn(),
      onChangeSectionAction: jest.fn(),
      removeSectionAction: jest.fn(),
      sectionIndex: 2,
    }

    SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
    SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
  })

  it("renders column buttons, artwork search and url input", () => {
    const component = getWrapper()

    expect(component.find(SectionControls).length).toBe(1)
    expect(component.find(ColumnButton).length).toBe(3)
    expect(component.find(Autocomplete).length).toBe(1)
    expect(component.find(InputArtworkUrl).length).toBe(1)
    expect(component.html()).toMatch(
      'placeholder="Search artworks by title..."'
    )
  })

  it("marks the current column count active", () => {
    const component = getWrapper()
    const active = component
      .find(ColumnButton)
      .filterWhere(button => button.prop("isActive"))

    expect(active.length).toBe(1)
    expect(active.prop("data-columns")).toBe(3)
  })

  it("defaults to 3 columns when the section has none", () => {
    props.editSection = { type: "artwork_grid", artworks }
    const component = getWrapper()
    const active = component
      .find(ColumnButton)
      .filterWhere(button => button.prop("isActive"))

    expect(active.prop("data-columns")).toBe(3)
  })

  it("changes the column count on click", () => {
    const component = getWrapper()
    component
      .find(ColumnButton)
      .filterWhere(button => button.prop("data-columns") === 4)
      .simulate("click")

    expect(props.onChangeSectionAction).toBeCalledWith("columns", 4)
  })

  it("saves the artwork list from Autocomplete, dropping nulls", () => {
    const component = getWrapper()
    const picked = { type: "artwork" as const, id: "c", slug: "slug-c" }
    component
      .find(Autocomplete)
      .props()
      .onSelect([...artworks, null, picked])

    expect(props.onChangeSectionAction).toBeCalledWith("artworks", [
      ...artworks,
      picked,
    ])
  })

  describe("#addArtwork", () => {
    it("appends a new artwork", () => {
      const picked = { type: "artwork" as const, id: "c", slug: "slug-c" }
      getInstance(getWrapper()).addArtwork(picked)

      expect(props.onChangeSectionAction).toBeCalledWith("artworks", [
        ...artworks,
        picked,
      ])
    })

    it("ignores duplicates and nulls", () => {
      const instance = getInstance(getWrapper())
      instance.addArtwork(artworks[0])
      instance.addArtwork(null)

      expect(props.onChangeSectionAction).not.toBeCalled()
    })
  })

  describe("#fetchArtwork", () => {
    const originalFetch = Backbone.Model.prototype.fetch

    afterEach(() => {
      Backbone.Model.prototype.fetch = originalFetch
    })

    it("logs an error and resolves null when the fetch fails", async () => {
      Backbone.Model.prototype.fetch = jest.fn(() => {
        throw new Error("nope")
      })
      const result = await getInstance(getWrapper()).fetchArtwork("1234")

      expect(result).toBeNull()
      expect(props.logErrorAction).toBeCalledWith({
        message: "Artwork not found.",
      })
    })
  })

  describe("#componentWillUnmount", () => {
    it("removes the section when it has no artworks", () => {
      props.editSection.artworks = []
      getWrapper().unmount()

      expect(props.removeSectionAction).toBeCalledWith(2)
    })

    it("keeps the section when it has artworks", () => {
      getWrapper().unmount()

      expect(props.removeSectionAction).not.toBeCalled()
    })
  })
})
