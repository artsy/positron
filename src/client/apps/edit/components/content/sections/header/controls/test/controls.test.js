import configureStore from "redux-mock-store"
import React from "react"
import { mount } from "enzyme"
import { Provider } from "react-redux"
import ModalCover from "../ModalCover"
import { VideoSectionControls } from "../../../video/controls"
import { LayoutControls } from "../LayoutControls"
import { VideoControls } from "../VideoControls"
import { HeaderControls } from "../index"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { IconLayoutFullscreen } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutFullscreen"
import { IconLayoutSplit } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutSplit"
import { IconLayoutText } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLayoutText"

describe("Feature Header Controls", () => {
  describe("LayoutControls", () => {
    const props = {
      article: { layout: "feature" },
      hero: {},
      onChange: jest.fn(),
      onChangeHeroAction: jest.fn(),
      onClick: jest.fn(),
      onProgress: jest.fn(),
    }

    it("renders change header controls", () => {
      const component = mount(<HeaderControls {...props} />)
      expect(component.html()).toMatch("edit-header--controls-open")
      expect(component.html()).toMatch("Change Header")
      expect(component.state().isLayoutOpen).toBe(false)
    })

    it("opens the menu on click", () => {
      const component = mount(<HeaderControls {...props} />)
      component
        .find(".edit-header--controls-open")
        .at(0)
        .simulate("click")
      expect(component.state().isLayoutOpen).toBe(true)
      expect(component.find(LayoutControls).exists()).toEqual(true)
      expect(component.find(ModalCover).exists()).toEqual(true)
      expect(component.find(IconLayoutFullscreen).exists()).toBe(true)
      expect(component.find(IconLayoutSplit).exists()).toBe(true)
      expect(component.find(IconLayoutText).exists()).toBe(true)
    })

    it("changes the layout click", () => {
      const component = mount(<HeaderControls {...props} />)
      component
        .find(".edit-header--controls-open")
        .at(0)
        .simulate("click")
      component
        .find("a")
        .at(0)
        .simulate("click")
      expect(props.onChangeHeroAction.mock.calls[0][0]).toMatch("type")
      expect(props.onChangeHeroAction.mock.calls[0][1]).toMatch("text")
    })
  })

  describe("VideoControls", () => {
    let props

    const getWrapper = props => {
      const mockStore = configureStore([])
      const store = mockStore({
        app: { channel: {} },
        edit: { article: {} },
      })

      return mount(
        <Provider store={store}>
          <section>
            <HeaderControls {...props} />
          </section>
        </Provider>
      )
    }

    beforeEach(() => {
      props = {
        article: StandardArticle,
        onChange: jest.fn(),
        onChangeHeroAction: jest.fn(),
        onClick: jest.fn(),
        onProgress: jest.fn(),
      }
      props.article.hero_section = {
        type: "basic",
        url: "foo",
        cover_image_url: "bar",
      }
    })

    it("does not render controls if not a BasicHeader type", () => {
      props.article.hero_section.type = "split"
      const component = getWrapper(props)

      expect(component.html()).not.toMatch('class="edit-header--video')
    })

    it("renders embed video controls", () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch("edit-header--video")
      expect(component.html()).toMatch("Embed Video")
      expect(component.find(VideoControls).getElement().props.isOpen).toBe(
        false
      )
    })

    it("opens the embed menu on click", () => {
      const component = getWrapper(props)
      component
        .find(".edit-header--video-open")
        .at(0)
        .simulate("click")

      expect(component.find(VideoControls).getElement().props.isOpen).toBe(true)
      expect(component.find(VideoSectionControls).exists()).toEqual(true)
      expect(component.find(ModalCover).exists()).toEqual(true)
    })
  })
})
