import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { FullScreenProvider } from "@artsy/reaction/dist/Components/Publishing/Sections/FullscreenViewer/FullScreenProvider"
import { mount } from "enzyme"
import { clone } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { SectionMarketingCollections } from "../index"
import { SectionControls } from "../../../section_controls"
import { MarketingCollectionsControls } from "../components/controls"
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
          <SectionMarketingCollections {...passedProps} />
        </FullScreenProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    article = clone(StandardArticle)
    // Hack: This should be in reaction.
    article.sections.push({
      id: "123456",
      type: "marketing_collection",
      slug: "marketing-collection",
      image_url: "artsy.net/image-url",
      name: ""
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

      expect(component.find(SectionMarketingCollections).length).toBe(1)
    })

    it("Renders a preview for standard/feature image_set", () => {
      props.editing = true
      const component = getWrapper()

      expect(component.find(MarketingCollectionsControls).length).toBe(1)
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
