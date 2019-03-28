import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import SectionControls from "client/apps/edit/components/content/section_controls"
import { ModalBackground } from "client/components/ModalBackground"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { HeaderControls } from "../index"
import { LayoutControls, OpenControlsContainer } from "../LayoutControls"
import { EmbedVideoControls, VideoControls } from "../VideoControls"

describe("HeaderControls", () => {
  let props
  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: { channel: {} },
      edit: { article: {} },
    })
    return mount(
      <Provider store={store}>
        <section>
          <HeaderControls {...passedProps} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: FeatureArticle,
      hero: FeatureArticle.hero_section,
      onClick: jest.fn(),
      onChangeHeroAction: jest.fn(),
      onProgress: jest.fn(),
    }
  })

  it("Renders as expected when closed", () => {
    const component = getWrapper()

    expect(component.text()).toMatch("Change Header +")
    expect(component.find(LayoutControls).length).toBe(1)

    expect(component.text()).not.toMatch("Embed Video +")
    expect(component.find(VideoControls).not.length).toBe(1)

    expect(component.find(ModalBackground).length).toBe(0)
  })

  it("Creates heroSection if not defined", () => {
    delete props.article.hero_section
    getWrapper()

    expect(props.onChangeHeroAction).toBeCalledWith("type", "text")
  })

  describe("LayoutControls", () => {
    it("opens LayoutControls", () => {
      const component = getWrapper()
      const instance = component
        .find(HeaderControls)
        .at(0)
        .instance() as HeaderControls

      component
        .find(OpenControlsContainer)
        .at(0)
        .simulate("click")

      expect(component.find(ModalBackground).length).toBe(1)
      expect(instance.state.isLayoutOpen).toBeTruthy()
    })

    it("closes LayoutControls", () => {
      const component = getWrapper()
      const instance = component
        .find(HeaderControls)
        .at(0)
        .instance() as HeaderControls
      instance.setState({ isLayoutOpen: true })
      component.update()

      component
        .find(ModalBackground)
        .at(0)
        .simulate("click")

      expect(component.find(ModalBackground).length).toBe(0)
      expect(instance.state.isLayoutOpen).toBeFalsy()
    })

    it("closes VideoControls when opening LayoutControls", () => {
      const component = getWrapper()
      const instance = component
        .find(HeaderControls)
        .at(0)
        .instance() as HeaderControls
      instance.setState({ isVideoOpen: true })
      component.update()

      component
        .find(OpenControlsContainer)
        .at(0)
        .simulate("click")

      expect(component.find(ModalBackground).length).toBe(1)
      expect(instance.state.isVideoOpen).toBeFalsy()
      expect(instance.state.isLayoutOpen).toBeTruthy()
    })
  })

  describe("VideoControls", () => {
    beforeEach(() => {
      props.article.hero_section = { type: "basic" }
    })

    it("Renders as expected when closed", () => {
      const component = getWrapper()

      expect(component.text()).toMatch("Embed Video +")
      expect(component.find(VideoControls).length).toBe(1)
    })

    it("opens VideoControls", () => {
      const component = getWrapper()
      const instance = component
        .find(HeaderControls)
        .at(0)
        .instance() as HeaderControls

      component
        .find(EmbedVideoControls)
        .at(0)
        .simulate("click")

      expect(component.find(ModalBackground).length).toBe(1)
      expect(instance.state.isVideoOpen).toBeTruthy()
      expect(component.find(SectionControls).length).toBe(1)
    })

    it("closes LayoutControls if when opening VideoControls", () => {
      const component = getWrapper()
      const instance = component
        .find(HeaderControls)
        .at(0)
        .instance() as HeaderControls
      instance.setState({ isLayoutOpen: true })
      component.update()

      component
        .find(EmbedVideoControls)
        .at(0)
        .simulate("click")

      expect(component.find(ModalBackground).length).toBe(1)
      expect(instance.state.isVideoOpen).toBeTruthy()
      expect(instance.state.isLayoutOpen).toBeFalsy()
    })

    it("closes VideoControls", () => {
      const component = getWrapper()
      const instance = component
        .find(HeaderControls)
        .at(0)
        .instance() as HeaderControls
      instance.setState({ isVideoOpen: true })
      component.update()

      component
        .find(ModalBackground)
        .at(0)
        .simulate("click")

      expect(component.find(ModalBackground).length).toBe(0)
      expect(instance.state.isVideoOpen).toBeFalsy()
    })
  })
})
