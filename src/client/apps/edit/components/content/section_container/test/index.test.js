import configureStore from "redux-mock-store"
import React from "react"
import { clone } from "lodash"
import { mount } from "enzyme"
import { Provider } from "react-redux"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { IconDrag } from "@artsy/reaction/dist/Components/Publishing/Icon/IconDrag"
import { RemoveButton } from "client/components/remove_button"
import SectionSlideshow from "../../sections/slideshow"
import { SectionText } from "../../sections/text/index.jsx"
import { SectionEmbed } from "../../sections/embed"
import { SectionImages } from "../../sections/images"
import { SectionVideo } from "../../sections/video"
import { SectionContainer, ClickToEdit, ContainerBackground } from "../index"
require("typeahead.js")

describe("SectionContainer", () => {
  let props
  window.scrollTo = jest.fn()

  const getWrapper = props => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: props.channel,
      },
      edit: {
        article: props.article,
        section: props.section,
        sectionIndex: props.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <SectionContainer {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    const article = clone(StandardArticle)

    props = {
      article: article,
      channel: { type: "editorial" },
      editing: false,
      index: 1,
      isHero: false,
      onRemoveHero: jest.fn(),
      onSetEditing: jest.fn(),
      section: { type: "image_collection", layout: "overflow_fillwidth" },
      sections: article.sections,
      sectionIndex: 1,
      removeSectionAction: jest.fn(),
    }
  })

  it("Renders drag and remove icons", () => {
    props.sectionIndex = 0
    const component = getWrapper(props)
    expect(component.find(RemoveButton).length).toBe(1)
    expect(component.find(IconDrag).length).toBe(1)
  })

  it("Does not renders drag and remove icons if editing", () => {
    const component = getWrapper(props)
    expect(component.find(RemoveButton).length).toBe(0)
    expect(component.find(IconDrag).length).toBe(0)
  })

  it("Calls onSetEditing with index on section click", () => {
    props.sectionIndex = 0
    const component = getWrapper(props)
    component
      .find(ClickToEdit)
      .at(0)
      .simulate("click")
    expect(props.onSetEditing).toBeCalledWith(props.index)
  })

  it("Calls onSetEditing with null on click off", () => {
    const component = getWrapper(props)
    component
      .find(ContainerBackground)
      .at(0)
      .simulate("click")
    expect(props.onSetEditing).toBeCalledWith(null)
  })

  it("Can remove a section click", () => {
    props.sectionIndex = 0
    const component = getWrapper(props)
    component
      .find(RemoveButton)
      .at(0)
      .simulate("click")

    expect(props.removeSectionAction).toBeCalledWith(props.index)
  })

  describe("Sections", () => {
    it("Can render an embed section", () => {
      props.section = { type: "embed" }
      const component = getWrapper(props)
      expect(component.find(SectionEmbed).length).toBe(1)
    })

    it("Can render an image section", () => {
      props.section = { type: "image" }
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    it("Can render an image_collection section", () => {
      props.section = { type: "image_collection" }
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    it("Can render an image_set section", () => {
      props.section = { type: "image_set" }
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    xit("Can render a slideshow section", () => {
      props.section = { type: "slideshow" }
      const component = getWrapper(props)
      expect(component.find(SectionSlideshow).length).toBe(1)
    })

    it("Can render a text section", () => {
      props.section = { type: "text", body: "" }
      const component = getWrapper(props)
      expect(component.find(SectionText).length).toBe(1)
    })

    it("Can render a video section", () => {
      props.section = { type: "video" }
      const component = getWrapper(props)
      expect(component.find(SectionVideo).length).toBe(1)
    })
  })

  describe("Hero Section", () => {
    beforeEach(() => {
      props.isHero = true
    })

    it("Can render an image section", () => {
      props.section.type = "image_set"
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    it("Can render a video section", () => {
      props.section.type = "video"
      const component = getWrapper(props)
      expect(component.find(SectionVideo).length).toBe(1)
    })

    it("Does not render drag icon", () => {
      const component = getWrapper(props)
      expect(component.find(IconDrag).length).toBe(0)
    })

    it("Can remove a hero section", () => {
      const component = getWrapper(props)
      component
        .find(RemoveButton)
        .at(0)
        .simulate("click")

      expect(props.onRemoveHero).toBeCalled()
    })
  })
})
