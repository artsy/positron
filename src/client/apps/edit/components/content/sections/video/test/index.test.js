import React from "react"
import configureStore from "redux-mock-store"
import { Editor } from "draft-js"
import { Provider } from "react-redux"
import { clone, extend } from "lodash"
import { mount } from "enzyme"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { ProgressBar } from "client/components/file_input/progress_bar"
import { RemoveButton } from "client/components/remove_button"
import { VideoSectionControls } from "../controls"
import { SectionVideo } from "../index.jsx"
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
        section: props.section,
      },
    })

    return mount(
      <Provider store={store}>
        <SectionVideo {...props} />
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
      section: video,
      onChangeHeroAction: jest.fn(),
      onChangeSectionAction: jest.fn(),
    }
  })

  it("Renders a placeholder", () => {
    props.section.url = null
    const component = getWrapper(props)

    expect(component.html()).toMatch("edit-section__placeholder")
    expect(component.text()).toMatch("Add a video above")
  })

  it("Renders a saved video and cover image", () => {
    const component = getWrapper(props)

    expect(component.find(SectionVideo).props().section.url).toMatch(video.url)
    expect(
      component.find(SectionVideo).props().section.cover_image_url
    ).toMatch(video.cover_image_url)
    expect(component.html()).not.toMatch("edit-section__placeholder")
    expect(component.text()).not.toMatch("Add a video above")
  })

  it("Renders the section controls when editing", () => {
    props.editing = true
    const component = getWrapper(props)

    expect(component.find(VideoSectionControls).exists()).toBe(true)
    expect(component.find("a.layout").exists()).toBe(true)
  })

  it("Does not render layout controls for hero sections", () => {
    props.editing = true
    props.isHero = true
    const component = getWrapper(props)

    expect(component.find(VideoSectionControls).exists()).toBe(true)
    expect(component.find("a.layout").exists()).toBe(false)
  })

  it("Does not render layout controls if props.hidePreview", () => {
    props.editing = true
    props.hidePreview = true
    const component = getWrapper(props)

    expect(component.find(VideoSectionControls).exists()).toBe(true)
    expect(component.find("a.layout").exists()).toBe(false)
  })

  it("#onProgress sets state.progress, renders progress bar if state.progress exists", () => {
    props.editing = true
    const progress = 0.5
    const component = getWrapper(props)
    component
      .find(SectionVideo)
      .instance()
      .onProgress(progress)
    component.update()

    expect(component.find(SectionVideo).instance().state.progress).toEqual(
      progress
    )
    expect(component.find(ProgressBar).exists()).toBe(true)
    expect(component.find(ProgressBar).getElement().props.progress).toBe(
      progress
    )
  })

  describe("Caption", () => {
    it("Renders a caption field with placeholder", () => {
      props.editing = true
      props.section.caption = ""
      const component = getWrapper(props)

      expect(component.find(Paragraph).exists()).toBe(true)
      expect(component.html()).toMatch(
        'class="public-DraftEditorPlaceholder-root"'
      )
    })

    it("Sets caption to readOnly if not editing", () => {
      const component = getWrapper(props)
      expect(component.find(Editor).props().readOnly).toBe(true)
    })

    it("Renders a saved caption", () => {
      props.editing = true
      const component = getWrapper(props)
      const caption = props.section.caption
        .replace("<p>", "")
        .replace("</p>", "")

      expect(component.find(Paragraph).exists()).toBe(true)
      expect(component.find(Paragraph).text()).toMatch(caption)
    })

    it("Can edit a caption", () => {
      props.editing = true
      const component = getWrapper(props)
      const caption = "<p>New Caption</p>"

      component
        .find(Paragraph)
        .getElement()
        .props.onChange(caption)
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("caption")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(caption)
      expect(component.find(Editor).props().readOnly).toBe(false)
    })
  })

  describe("Remove Button", () => {
    it("Renders video remove button if editing and has url", () => {
      props.section.cover_image_url = null
      props.editing = true
      const component = getWrapper(props)

      expect(component.find(RemoveButton).exists()).toEqual(true)
    })

    it("Can remove the video url", () => {
      props.section.cover_image_url = null
      props.editing = true
      const component = getWrapper(props)

      component.find(RemoveButton).simulate("click")
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("url")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBeFalsy()
    })

    it("Renders cover remove button if editing and has cover_image_url", () => {
      props.editing = true
      const component = getWrapper(props)

      expect(component.find(RemoveButton).exists()).toEqual(true)
    })

    it("Can remove the cover_image_url", () => {
      props.editing = true
      const component = getWrapper(props)

      component.find(RemoveButton).simulate("click")
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe(
        "cover_image_url"
      )
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBeFalsy()
    })
  })

  describe("Hero Section", () => {
    it("Can change a hero section caption", () => {
      props.editing = true
      props.isHero = true
      const component = getWrapper(props)
      const caption = "<p>New Caption</p>"

      component
        .find(Paragraph)
        .getElement()
        .props.onChange(caption)
      expect(props.onChangeHeroAction.mock.calls[0][0]).toBe("caption")
      expect(props.onChangeHeroAction.mock.calls[0][1]).toBe(caption)
    })

    it("Can remove Hero cover_image_url", () => {
      props.editing = true
      props.isHero = true
      const component = getWrapper(props)

      component.find(RemoveButton).simulate("click")
      expect(props.onChangeHeroAction.mock.calls[0][0]).toBe("cover_image_url")
      expect(props.onChangeHeroAction.mock.calls[0][1]).toBeFalsy()
    })

    it("Can remove Hero video url", () => {
      props.section.cover_image_url = null
      props.editing = true
      props.isHero = true
      const component = getWrapper(props)

      component.find(RemoveButton).simulate("click")
      expect(props.onChangeHeroAction.mock.calls[0][0]).toBe("url")
      expect(props.onChangeHeroAction.mock.calls[0][1]).toBeFalsy()
    })
  })
})
