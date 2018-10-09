import React from "react"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import { Paragraph } from "../../../../../../../components/draft/paragraph/paragraph"
import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { SectionFooter } from "../index.jsx"

describe("SectionFooter", () => {
  let props

  beforeEach(() => {
    props = {
      article: cloneDeep(FeatureArticle),
      channel: { type: "editorial" },
      onChangeArticleAction: jest.fn(),
    }
  })

  const getWrapper = props => {
    return mount(<SectionFooter {...props} />)
  }

  it("Shows a postscript field if channel hasFeature", () => {
    props.article.postscript = ""
    const component = getWrapper(props)

    expect(component.find(Paragraph).exists()).toBe(true)
    expect(component.text()).toMatch("Postscript (optional)")
  })

  it("Does not a postscript field if channel does not hasFeature", () => {
    props.channel.type = "partner"
    const component = getWrapper(props)

    expect(component.find(Paragraph).exists()).toBe(false)
    expect(component.text()).not.toMatch("Postscript (optional)")
  })

  it("Can render a saved postscript", () => {
    const component = getWrapper(props)
    const expectedPostscript = FeatureArticle.postscript
      .replace("<p>", "")
      .replace("</p>", "")

    expect(component.html()).toMatch(expectedPostscript)
  })
})
