import { SeriesArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { FixedBackground } from "@artsy/reaction/dist/Components/Publishing/Series/FixedBackground"
import { SeriesAbout } from "@artsy/reaction/dist/Components/Publishing/Series/SeriesAbout"
import { SeriesTitle } from "@artsy/reaction/dist/Components/Publishing/Series/SeriesTitle"
import { RelatedArticles } from "client/apps/edit/components/content/sections/related_articles"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import FileInput from "client/components/file_input"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { EditSeries } from "../series"
require("typeahead.js")

beforeAll(() => {
  jest.mock("sharify", () => ({
    data: {
      USER: { access_token: "123" },
    },
  }))

  jest.mock("superagent", () => {
    return {
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      query: jest.fn().mockReturnValue({
        end: jest.fn(),
      }),
    }
  })
})

afterAll(() => {
  jest.clearAllMocks()
})

describe("EditSeries", () => {
  const getWrapper = (passedProps = props) => {
    return mount(<EditSeries {...passedProps} />)
  }

  let props
  beforeEach(() => {
    props = {
      article: cloneDeep(SeriesArticle),
      onChangeArticleAction: jest.fn(),
    }
  })

  it("Renders SeriesTitle", () => {
    const component = getWrapper()
    const title = component
      .find(PlainText)
      .at(0)
      .props()

    expect(component.find(SeriesTitle).length).toBe(1)
    expect(title.content).toBe("The Future of Art")
    expect(title.placeholder).toBe("Title")
  })

  it("Can change a SeriesTitle", () => {
    const component = getWrapper()
    component
      .find(PlainText)
      .at(0)
      .props()
      .onChange("New title")
    expect(props.onChangeArticleAction).toBeCalledWith("title", "New title")
  })

  it("Renders RelatedArticles list", () => {
    const component = getWrapper()
    expect(component.find(RelatedArticles).length).toBe(1)
  })

  it("Renders SeriesAbout", () => {
    const component = getWrapper()
    expect(component.find(SeriesAbout).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(1)
  })

  it("Renders editable series subTitle", () => {
    props.article.series = { sub_title: "This Feature" }
    const component = getWrapper()
    const subTitle = component
      .find(PlainText)
      .at(1)
      .props()

    expect(subTitle.placeholder).toBe("About the Series")
    expect(subTitle.content).toBe("This Feature")
  })

  it("Can change a series subTitle", () => {
    const component = getWrapper()
    component
      .find(PlainText)
      .at(1)
      .props()
      .onChange("New subTitle")

    expect(props.onChangeArticleAction).toBeCalledWith(
      "series.sub_title",
      "New subTitle"
    )
  })

  it("Renders a file input for background image ", () => {
    props.article.hero_section = { url: null }
    const component = getWrapper()
    expect(component.find(FileInput).length).toBe(1)
    expect(component.text()).toMatch("+ Add Background")
  })

  it("Can save a hero_section with type", () => {
    delete props.article.hero_section
    const component = getWrapper()
    const input = component
      .find(FileInput)
      .first()
      .getElement()
    input.props.onUpload("http://new-image.jpg")

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("hero_section")
    expect(props.onChangeArticleAction.mock.calls[0][1].url).toBe(
      "http://new-image.jpg"
    )
    expect(props.onChangeArticleAction.mock.calls[0][1].type).toBe("series")
  })

  describe("Image and Video Backgrounds", () => {
    const videoUrl = "http://video.mp4"
    const imageUrl = "http://image.jpg"

    const render = url => {
      props.article.hero_section = { url }
      return getWrapper()
    }

    it("Passes a background URL to reaction if it contains an image", () => {
      const component = render(imageUrl)
      const bg = component.find(FixedBackground)
      const url = bg.props().backgroundUrl
      expect(bg.length).toBe(1)
      expect(url).toBe("http://image.jpg")
      expect(component.text()).toMatch("+ Change Background")
    })

    it("Passes a background URL to reaction if it contains a video", () => {
      const component = render(videoUrl)
      const bg = component.find(FixedBackground)
      const url = bg.props().backgroundUrl
      expect(bg.length).toBe(1)
      expect(url).toBe(videoUrl)
      expect(component.text()).toMatch("+ Change Background")
    })
  })
})
