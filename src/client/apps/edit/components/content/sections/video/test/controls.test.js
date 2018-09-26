import configureStore from "redux-mock-store"
import React from "react"
import { clone, extend } from "lodash"
import { mount } from "enzyme"
import { Provider } from "react-redux"
import FileInput from "client/components/file_input"
import { SectionControls } from "../../../section_controls"
import { VideoSectionControls } from "../controls"
import { Videos } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"

describe("Video", () => {
  let props
  let video

  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: props.article,
        section: props.editSection,
        sectionIndex: props.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <section>
          <VideoSectionControls {...props} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    video = extend(clone(Videos[1]), {
      type: "video",
      url: "https://www.youtube.com/watch?v=PXi7Kjlsz9A",
    })

    props = {
      article: { layout: "standard" },
      editSection: video,
      removeSectionAction: jest.fn(),
      section: video,
      sectionIndex: 2,
      onChange: jest.fn(),
      onProgress: jest.fn(),
    }

    SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
    SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
  })

  it("Renders input fields", () => {
    const component = getWrapper(props)

    expect(component.find(FileInput).exists()).toBe(true)
    expect(component.find("input").length).toBe(2)
    expect(
      component
        .find("input")
        .at(0)
        .getElement().props.placeholder
    ).toMatch("Paste a youtube or vimeo url")
  })

  it("Hides layout controls by default", () => {
    const component = getWrapper(props)
    expect(component.find("a.layout").exists()).toBeFalsy()
  })

  it("Renders layout controls if props.showLayouts", () => {
    props.showLayouts = true
    const component = getWrapper(props)

    expect(component.find("a.layout").length).toBe(2)
  })

  it("Renders fullscreen controls if article is feature", () => {
    props.showLayouts = true
    props.article.layout = "feature"
    const component = getWrapper(props)

    expect(component.find("a.layout").length).toEqual(3)
  })

  it("Can update a video url", () => {
    const component = getWrapper(props)
    const input = component.find(".bordered-input")
    const validUrl = "http://hello.com"

    input.instance().value = validUrl
    input.simulate("change", { target: { value: validUrl } })
    expect(props.onChange.mock.calls[0][0]).toBe("url")
    expect(props.onChange.mock.calls[0][1]).toBe(validUrl)
  })

  it("Does not update video url if invalid", () => {
    const component = getWrapper(props)
    const input = component.find(".bordered-input")
    const value = "invalid url"

    input.simulate("change", { target: { value } })
    expect(props.onChange.mock.calls.length).toBe(0)
  })

  it("Resets the cover url if video url is empty", () => {
    const component = getWrapper(props)

    const input = component.find(".bordered-input")
    input.instance().value = ""
    input.simulate("change", { target: { value: "" } })

    expect(props.onChange.mock.calls[0][0]).toBe("url")
    expect(props.onChange.mock.calls[0][1]).toBe("")
    expect(props.onChange.mock.calls[1][0]).toBe("cover_image_url")
    expect(props.onChange.mock.calls[1][1]).toBe("")
  })

  it("Can update a cover image", () => {
    const component = getWrapper(props)
    const src = "http://image.jpg"
    component
      .find(FileInput)
      .getElement()
      .props.onUpload(src, 400, 300)
    expect(props.onChange.mock.calls[0][0]).toBe("cover_image_url")
    expect(props.onChange.mock.calls[0][1]).toBe(src)
  })

  it("Removes the section on unmount if no url", () => {
    props.section.url = ""
    const component = getWrapper(props).find(VideoSectionControls)

    component.instance().componentWillUnmount()
    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.sectionIndex)
  })
})
