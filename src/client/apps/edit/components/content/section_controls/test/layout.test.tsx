import {
  FeatureArticle,
  StandardArticle,
} from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { IconImageFullscreen } from "@artsy/reaction/dist/Components/Publishing/Icon/IconImageFullscreen"
import { IconImageSet } from "@artsy/reaction/dist/Components/Publishing/Icon/IconImageSet"
import { mount } from "enzyme"
import { clone } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { LayoutButton, LayoutControls } from "../layout"

describe("Section LayoutControls", () => {
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: passedProps.channel,
      },
      edit: {
        article: passedProps.article,
        section: passedProps.section,
        sectionIndex: passedProps.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <section>
          <LayoutControls {...passedProps} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      channel: { type: "editorial" },
      section: StandardArticle.sections && clone(StandardArticle.sections[4]),
      article: { layout: "standard" },
      onChangeSectionAction: jest.fn(),
      disabledAlert: jest.fn(),
    }
  })

  describe("Section Layouts", () => {
    it("does not render image_set icon for support or partner channels", () => {
      props.channel.type = "partner"
      const component = getWrapper()

      expect(component.find(LayoutButton).length).toBe(2)
      expect(component.find(IconImageSet).length).toBe(0)
    })

    it("renders image_set icon if channel has features and section is images", () => {
      props.channel.type = "team"
      const component = getWrapper()

      expect(component.find(LayoutButton).length).toBe(3)
      expect(component.find(IconImageSet).length).toBe(1)
    })

    it("does not render image_set icon if section is not images", () => {
      props.section = StandardArticle.sections && StandardArticle.sections[0]
      const component = getWrapper()

      expect(component.find(LayoutButton).length).toBe(2)
      expect(component.find(IconImageSet).length).toBe(0)
    })

    it("shows a fullscreen icon if layout is feature and section has images", () => {
      props.article.layout = "feature"
      const component = getWrapper()

      expect(component.find(LayoutButton).length).toBe(4)
      expect(component.find(IconImageFullscreen).length).toBe(1)
    })

    it("shows a fullscreen icon if layout is feature and section is embed", () => {
      props.section = StandardArticle.sections && StandardArticle.sections[10]
      props.article.layout = "feature"
      const component = getWrapper()

      expect(component.find(LayoutButton).length).toBe(3)
      expect(component.find(IconImageFullscreen).length).toBe(1)
    })

    it("shows a fullscreen icon if layout is feature and section is video", () => {
      props.section = FeatureArticle.sections && FeatureArticle.sections[6]
      props.article.layout = "feature"
      const component = getWrapper()

      expect(component.find(IconImageFullscreen).length).toBe(1)
    })
  })

  describe("#changeLayout", () => {
    it("changes the layout on click", () => {
      const component = getWrapper()

      component
        .find(LayoutButton)
        .at(1)
        .simulate("click")
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("layout")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe("column_width")
    })

    it("when toggling fullscreen, alerts the user if too many images", () => {
      props.article.layout = "feature"
      const component = getWrapper(props)

      component
        .find(LayoutButton)
        .at(2)
        .simulate("click")
      expect(props.disabledAlert.mock.calls.length).toBe(1)
      expect(props.onChangeSectionAction).not.toBeCalled()
    })

    it("can convert an image_set into an image_collection", () => {
      props.section.type = "image_set"
      delete props.section.layout

      const component = getWrapper()

      component
        .find(LayoutButton)
        .at(1)
        .simulate("click")
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("type")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(
        "image_collection"
      )
      expect(props.onChangeSectionAction.mock.calls[1][0]).toBe("layout")
      expect(props.onChangeSectionAction.mock.calls[1][1]).toBe("column_width")
    })
  })

  describe("#toggleImageSet", () => {
    it("converts an image_collection to an image_set", () => {
      const component = getWrapper()

      component
        .find(LayoutButton)
        .at(2)
        .simulate("click")
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("type")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe("image_set")
      expect(props.onChangeSectionAction.mock.calls[1][0]).toBe("layout")
      expect(props.onChangeSectionAction.mock.calls[1][1]).toBe("mini")
    })

    it("does nothing if section is already an image_set", () => {
      props.section.type = "image_set"
      props.section.layout = "mini"
      const component = getWrapper()

      component
        .find(LayoutButton)
        .at(2)
        .simulate("click")
      expect(props.onChangeSectionAction).not.toBeCalled()
    })
  })
})
