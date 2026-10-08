import { Videos } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"
import { LayoutButton } from "client/apps/edit/components/content/section_controls/layout"
import FileInput from "client/components/file_input"
import { mount } from "enzyme"
import { clone, extend } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { SectionControls } from "../../../section_controls"
import { VideoSectionControls } from "../controls"
import { detectAspectRatio } from "../utils"

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  detectAspectRatio: jest.fn(),
}))

describe("Video", () => {
  let props
  let video

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: passedProps.article,
        section: passedProps.editSection,
        sectionIndex: passedProps.sectionIndex,
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

    detectAspectRatio.mockReset().mockResolvedValue(null)
    SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
    SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
  })

  it("Renders input fields", () => {
    const component = getWrapper()

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
    const component = getWrapper()
    expect(component.find(LayoutButton).exists()).toBeFalsy()
  })

  it("Renders layout controls if props.showLayouts", () => {
    props.showLayouts = true
    const component = getWrapper()

    expect(component.find(LayoutButton).length).toBe(2)
  })

  it("Renders fullscreen controls if article is feature", () => {
    props.showLayouts = true
    props.article.layout = "feature"
    const component = getWrapper()

    expect(component.find(LayoutButton).length).toEqual(3)
  })

  it("Can update a video url", () => {
    const component = getWrapper()
    const input = component.find(".bordered-input")
    const validUrl = "http://hello.com"

    input.instance().value = validUrl
    input.simulate("change", { target: { value: validUrl } })
    expect(props.onChange.mock.calls[0][0]).toBe("url")
    expect(props.onChange.mock.calls[0][1]).toBe(validUrl)
  })

  it("Does not update video url if invalid", () => {
    const component = getWrapper()
    const input = component.find(".bordered-input")
    const value = "invalid url"

    input.simulate("change", { target: { value } })
    expect(props.onChange.mock.calls.length).toBe(0)
  })

  it("Resets the cover url if video url is empty", () => {
    const component = getWrapper()

    const input = component.find(".bordered-input")
    input.instance().value = ""
    input.simulate("change", { target: { value: "" } })

    expect(props.onChange.mock.calls[0][0]).toBe("url")
    expect(props.onChange.mock.calls[0][1]).toBe("")
    expect(props.onChange.mock.calls[1][0]).toBe("cover_image_url")
    expect(props.onChange.mock.calls[1][1]).toBe("")
  })

  it("Can update a cover image", () => {
    const component = getWrapper()
    const src = "http://image.jpg"
    component
      .find(FileInput)
      .getElement()
      .props.onUpload(src, 400, 300)
    expect(props.onChange.mock.calls[0][0]).toBe("cover_image_url")
    expect(props.onChange.mock.calls[0][1]).toBe(src)
  })

  describe("Aspect ratio", () => {
    const flushPromises = () => new Promise(resolve => setImmediate(resolve))
    const selectedRatio = component =>
      component
        .find("[data-aspect-ratio]")
        .filterWhere(radio => radio.props().isActive)
        .first()
        .props()["data-aspect-ratio"]

    it("Defaults to 16:9", () => {
      expect(selectedRatio(getWrapper())).toBe("16:9")
    })

    it("Selects the saved ratio", () => {
      props.section.aspect_ratio = 9 / 16
      expect(selectedRatio(getWrapper())).toBe("9:16")
    })

    it("Lists a detected ratio that isn't a preset", () => {
      props.section.aspect_ratio = 2.39
      expect(selectedRatio(getWrapper())).toBe("2.39:1")
    })

    it("Can pick a ratio", () => {
      const component = getWrapper()

      component
        .find('[data-aspect-ratio="9:16"]')
        .first()
        .simulate("click")
      expect(props.onChange).toBeCalledWith("aspect_ratio", 9 / 16)
    })

    it("Is hidden for hero sections", () => {
      props.isHero = true
      const component = getWrapper()

      expect(component.find("[data-aspect-ratio]").exists()).toBe(false)
    })

    it("Detects the ratio when the url changes", async () => {
      const url = "https://vimeo.com/265111898"
      detectAspectRatio.mockResolvedValue(0.5625)
      const component = getWrapper()

      component
        .find(".bordered-input")
        .simulate("change", { target: { value: url } })
      await flushPromises()

      expect(detectAspectRatio).toBeCalledWith(url)
      expect(props.onChange).toBeCalledWith("aspect_ratio", 0.5625)
    })

    it("Clears the ratio when the url is removed", async () => {
      const component = getWrapper()

      component
        .find(".bordered-input")
        .simulate("change", { target: { value: "" } })
      await flushPromises()

      expect(detectAspectRatio).not.toBeCalled()
      expect(props.onChange).toBeCalledWith("aspect_ratio", null)
    })

    it("Ignores a detection that finishes after a manual pick", async () => {
      detectAspectRatio.mockResolvedValue(0.5625)
      const component = getWrapper()

      component
        .find(".bordered-input")
        .simulate("change", { target: { value: "https://vimeo.com/1" } })
      component
        .find('[data-aspect-ratio="1:1"]')
        .first()
        .simulate("click")
      await flushPromises()

      const ratios = props.onChange.mock.calls.filter(
        ([key]) => key === "aspect_ratio"
      )
      expect(ratios).toEqual([["aspect_ratio", 1]])
    })

    it("Does not detect for hero sections", async () => {
      props.isHero = true
      const component = getWrapper()

      component
        .find(".bordered-input")
        .simulate("change", { target: { value: "https://vimeo.com/1" } })
      await flushPromises()

      expect(detectAspectRatio).not.toBeCalled()
    })
  })

  it("Removes the section on unmount if no url", () => {
    props.section.url = ""
    const component = getWrapper().find(VideoSectionControls)

    component.instance().componentWillUnmount()
    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.sectionIndex)
  })
})
