import { DragDropList } from "client/components/drag_drop2"
import { EditSectionPlaceholder } from "client/components/edit_section_placeholder"
import { RemoveButton } from "client/components/remove_button"
import { ArtworkGridArtwork } from "client/typings/sections"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { ArtworkGridItem } from "../components/artwork_grid_item"
import { ArtworkGridControls } from "../components/controls"
import { SectionArtworkGrid } from "../index"
require("typeahead.js")

describe("SectionArtworkGrid", () => {
  let artworks: ArtworkGridArtwork[]
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: { channel: { type: "editorial" } },
      edit: {
        article: { layout: "standard" },
        section: passedProps.section,
        sectionIndex: 0,
      },
    })

    return mount(
      <Provider store={store}>
        <SectionArtworkGrid {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    artworks = ["a", "b", "c"].map(id => ({
      type: "artwork" as const,
      id,
      slug: `slug-${id}`,
      title: `Title ${id}`,
      image: `http://image-${id}.png`,
    }))
    props = {
      editing: false,
      onChangeSectionAction: jest.fn(),
      section: { type: "artwork_grid", columns: 3, artworks },
    }
  })

  it("renders an item for each artwork", () => {
    const component = getWrapper()

    expect(component.find(ArtworkGridItem).length).toBe(3)
    expect(component.find(DragDropList).exists()).toBe(false)
  })

  it("renders controls only when editing", () => {
    expect(
      getWrapper()
        .find(ArtworkGridControls)
        .exists()
    ).toBe(false)

    props.editing = true
    expect(
      getWrapper()
        .find(ArtworkGridControls)
        .exists()
    ).toBe(true)
  })

  it("renders a placeholder when there are no artworks", () => {
    props.section.artworks = []
    const component = getWrapper()

    expect(component.find(EditSectionPlaceholder).exists()).toBe(true)
    expect(component.find(ArtworkGridItem).exists()).toBe(false)
  })

  it("tolerates a section with no artworks key", () => {
    props.section = { type: "artwork_grid" }
    const component = getWrapper()

    expect(component.find(EditSectionPlaceholder).exists()).toBe(true)
  })

  it("renders a drag-and-drop list when editing more than one artwork", () => {
    props.editing = true
    const component = getWrapper()

    expect(component.find(DragDropList).exists()).toBe(true)
    expect(component.find(ArtworkGridItem).length).toBe(3)
  })

  it("does not render a drag-and-drop list for a single artwork", () => {
    props.editing = true
    props.section.artworks = [artworks[0]]
    const component = getWrapper()

    expect(component.find(DragDropList).exists()).toBe(false)
  })

  it("removes an artwork when its remove button is clicked", () => {
    props.editing = true
    const component = getWrapper()
    component
      .find(RemoveButton)
      .at(1)
      .simulate("click")

    expect(props.onChangeSectionAction).toBeCalledWith("artworks", [
      artworks[0],
      artworks[2],
    ])
  })

  it("reorders artworks via onDragEnd", () => {
    props.editing = true
    const component = getWrapper()
    const reordered = [artworks[2], artworks[0], artworks[1]]
    component
      .find(DragDropList)
      .props()
      .onDragEnd(reordered)

    expect(props.onChangeSectionAction).toBeCalledWith("artworks", reordered)
  })
})
