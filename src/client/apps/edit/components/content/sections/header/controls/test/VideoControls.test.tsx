import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { VideoSectionControls } from "../../../video/controls"
import { EmbedVideoControls, VideoControls } from "../VideoControls"

describe("VideoControls", () => {
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
          <VideoControls {...passedProps} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: StandardArticle,
      onChange: jest.fn(),
      onClick: jest.fn(),
      onProgress: jest.fn(),
      isOpen: false,
    }

    props.article.hero_section = {
      type: "basic",
      url: "foo",
      cover_image_url: "bar",
    }
  })

  it("Renders as expected when props.isOpen is false", () => {
    const component = getWrapper()

    expect(component.text()).toMatch("Embed Video +")
    expect(component.find(VideoSectionControls).exists()).toBeFalsy()
  })

  it("Renders as expected when props.isOpen is true", () => {
    props.isOpen = true
    const component = getWrapper()
    expect(component.find(VideoSectionControls).exists()).toBeTruthy()
  })

  it("Calls props.onClick on click", () => {
    const component = getWrapper()
    component
      .find(EmbedVideoControls)
      .at(0)
      .simulate("click")

    expect(props.onClick).toBeCalled()
  })
})
