import React from "react"
import { cloneDeep } from "lodash"
import { mount } from "enzyme"
import { SeriesArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { FixedBackground } from "@artsy/reaction/dist/Components/Publishing/Series/FixedBackground"
import { SeriesAbout } from "@artsy/reaction/dist/Components/Publishing/Series/SeriesAbout"
import { SeriesTitle } from "@artsy/reaction/dist/Components/Publishing/Series/SeriesTitle"
import FileInput from "client/components/file_input"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import { RelatedArticles } from "client/apps/edit/components/content/sections/related_articles"
import { EditSeries } from "../series"
require("typeahead.js")

describe("EditSeries", () => {
  const getWrapper = props => {
    return mount(<EditSeries {...props} />)
  }

  let props
  beforeEach(() => {
    props = {
      article: cloneDeep(SeriesArticle),
      onChangeArticleAction: jest.fn(),
    }
  })

  it("Renders SeriesTitle", () => {
    const component = getWrapper(props)
    expect(component.find(SeriesTitle).length).toBe(1)
    expect(
      component
        .find(PlainText)
        .at(0)
        .props().name
    ).toBe("title")
  })

  it("Renders RelatedArticles list", () => {
    const component = getWrapper(props)
    expect(component.find(RelatedArticles).length).toBe(1)
  })

  it("Renders SeriesAbout", () => {
    const component = getWrapper(props)
    expect(component.find(SeriesAbout).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(1)
  })

  it("Renders editable series subTitle", () => {
    props.article.series = { sub_title: "This Feature" }
    const component = getWrapper(props)

    expect(
      component
        .find(PlainText)
        .at(1)
        .props().name
    ).toBe("series.sub_title")
    expect(
      component
        .find(PlainText)
        .at(1)
        .props().content
    ).toBe("This Feature")
  })

  it("Renders a file input for background image ", () => {
    props.article.hero_section = { url: null }
    const component = getWrapper(props)
    expect(component.find(FileInput).length).toBe(1)
    expect(component.text()).toMatch("+ Add Background")
  })

  it("Can save a hero_section with type", () => {
    delete props.article.hero_section
    const component = getWrapper(props)
    const input = component
      .find(FileInput)
      .first()
      .getElement()
    input.props.onUpload("http://new-image.jpg")

    expect(props.onChangeArticleAction.mock.calls[0][0].hero_section.url).toBe(
      "http://new-image.jpg"
    )
    expect(props.onChangeArticleAction.mock.calls[0][0].hero_section.type).toBe(
      "series"
    )
  })

  it("Renders a background image if url", () => {
    props.article.hero_section = { url: "http://image.jpg" }
    const component = getWrapper(props)
    expect(component.find(FixedBackground).length).toBe(1)
    expect(component.find(FixedBackground).props().backgroundUrl).toBe(
      "http://image.jpg"
    )
    expect(component.text()).toMatch("+ Change Background")
  })
})
