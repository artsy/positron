import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { SectionControls } from "../index"
import { LayoutControls } from "../layout"

describe("Section Controls", () => {
  let props
  let article

  SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
  SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
  $.fn.offset = jest.fn().mockReturnValue({ top: 200 })
  $.fn.height = jest.fn().mockReturnValue(200)
  $.fn.closest = jest.fn().mockReturnThis()

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
          <SectionControls {...passedProps} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    article = cloneDeep(StandardArticle)
    props = {
      channel: { type: "editorial" },
      section: article.sections && article.sections[4],
      article,
      onChange: jest.fn(),
      disabledAlert: jest.fn(),
      showLayouts: true,
    }
  })

  describe("Section Layouts", () => {
    it("does not render section layouts unless showLayouts", () => {
      props.showLayouts = false
      const component = getWrapper(props)

      expect(component.find(LayoutControls).exists()).toBe(false)
    })

    it("renders section layouts if showLayouts is true", () => {
      const component = getWrapper(props)

      expect(component.find(LayoutControls).exists()).toBe(true)
    })
  })

  describe("#setInsideComponent", () => {
    it("returns true if item is scrolled over and not scrolled past", () => {
      const component = getWrapper(props)
        .find(SectionControls)
        .instance() as SectionControls
      component.setInsideComponent()

      expect(component.state.insideComponent).toBe(true)
    })

    it("returns false if item is scrolled past", () => {
      const component = getWrapper(props)
        .find(SectionControls)
        .instance() as SectionControls
      component.isScrolledPast = jest.fn().mockReturnValue(true)
      component.setInsideComponent()

      expect(component.state.insideComponent).toBe(false)
    })

    it("returns false when hero section", () => {
      props.isHero = true
      const component = getWrapper(props)
        .find(SectionControls)
        .instance() as SectionControls

      component.setInsideComponent()
      expect(component.state.insideComponent).toBe(false)
    })
  })

  describe("#getHeaderSize", () => {
    it("returns 55 when channel is not artsy channel", () => {
      props.channel.type = "partner"
      const component = getWrapper(props)
        .find(SectionControls)
        .instance() as SectionControls
      const header = component.getHeaderHeight()

      expect(header).toBe(55)
    })

    it("returns 95 when channel is artsy channel", () => {
      const component = getWrapper(props)
        .find(SectionControls)
        .instance() as SectionControls
      const header = component.getHeaderHeight()

      expect(header).toBe(89)
    })
  })

  describe("#getPositionBottom", () => {
    it("when insideComponent, calculates based on window scroll position", () => {
      props.isHero = false
      const component = getWrapper(props)
        .find(SectionControls)
        .instance() as SectionControls
      component.setState({ insideComponent: true })
      const bottom = component.getPositionBottom()

      expect(bottom).toBe("611px")
    })

    it("when outside component, returns 100%", () => {
      const component = getWrapper(props)
        .find(SectionControls)
        .instance() as SectionControls
      component.setState({ insideComponent: false })
      const bottom = component.getPositionBottom()

      expect(bottom).toBe("100%")
    })
  })
})
