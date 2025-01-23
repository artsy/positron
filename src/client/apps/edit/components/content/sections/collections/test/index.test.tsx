import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { FullScreenProvider } from "@artsy/reaction/dist/Components/Publishing/Sections/FullscreenViewer/FullScreenProvider"
import { mount, shallow } from "enzyme"
import { clone } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { SectionCollections } from "../../collections/index"
import { SectionControls } from "../../../section_controls"
import { CollectionsControls } from "../components/controls"
require("typeahead.js")

describe("SectionImageCollection", () => {
  let props
  let article
  let collectionSection

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {},
      },
      edit: {
        article: passedProps.article,
        section: passedProps.section,
      },
    })

    return mount(
      <Provider store={store}>
        <FullScreenProvider>
          <SectionCollections {...passedProps} />
        </FullScreenProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    article = clone(StandardArticle)
    // Hack: This should be in reaction.
    article.sections.push({
      id: "123456",
      type: "collection",
      slug: "marketing-collection",
      image_url: "artsy.net/image-url",
      display: ""
    })

    collectionSection = clone(article.sections[article.sections.length - 1])

    props = {
      article,
      editing: false,
      section: collectionSection,
      onChangeSectionAction: jest.fn(),
    }
  })

  describe("Rendering", () => {
    it("Renders a preview for marketing collections", () => {
      const component = getWrapper()

      expect(component.find(SectionCollections).length).toBe(1)
    })

    it("Renders a preview for standard/feature image_set", () => {
      props.editing = true
      const component = getWrapper()

      expect(component.find(CollectionsControls).length).toBe(1)
    })

    it("Renders controls if editing", () => {
      props.editing = true
      const component = getWrapper()

      expect(component.find(SectionControls).exists()).toBe(true)
    })

    it("Renders a placeholder if editing and no images", () => {
      props.editing
      const component = getWrapper()

      expect(component.text()).toBe("Search for Collections above")
    })
  })
})
