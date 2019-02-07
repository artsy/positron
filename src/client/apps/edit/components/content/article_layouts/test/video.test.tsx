import { VideoArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { VideoAbout } from "@artsy/reaction/dist/Components/Publishing/Video/VideoAbout"
import { VideoCover } from "@artsy/reaction/dist/Components/Publishing/Video/VideoCover"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import FileInput from "client/components/file_input"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { EditVideo } from "../video"
require("typeahead.js")

describe("EditVideo", () => {
  const getWrapper = (passedProps = props) => {
    return mount(<EditVideo {...passedProps} />)
  }

  let props
  beforeEach(() => {
    props = {
      article: cloneDeep(VideoArticle),
      onChangeArticleAction: jest.fn(),
    }
  })

  it("Renders VideoCover with text fields", () => {
    const component = getWrapper(props)
    expect(component.find(VideoCover).length).toBe(1)
    expect(component.find(PlainText).length).toBe(2)
  })

  it("Renders VideoAbout with paragraph fields", () => {
    const component = getWrapper(props)
    expect(component.find(VideoAbout).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(2)
  })

  it("Renders a file input for video and cover", () => {
    const component = getWrapper(props)
    expect(component.find(FileInput).length).toBe(2)
    expect(component.text()).toMatch("+ Change Video")
    expect(component.text()).toMatch("+ Change Cover Image")
  })

  it("#onMediaChange updates the media blob", () => {
    const component = getWrapper(props)
    const instance = component.instance() as EditVideo
    instance.onMediaChange("description", "")
    expect(props.onChangeArticleAction.mock.calls[0][1].description).toBe("")
    instance.onMediaChange("description", "Sample Description")
    expect(props.onChangeArticleAction.mock.calls[1][1].description).toBe(
      "Sample Description"
    )
    instance.onMediaChange("duration", 100)
    expect(props.onChangeArticleAction.mock.calls[2][1].duration).toBe(100)
    instance.onMediaChange("published", false)
    expect(props.onChangeArticleAction.mock.calls[3][1].published).toBe(false)
  })
})
