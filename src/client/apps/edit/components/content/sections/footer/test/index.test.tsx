import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Paragraph } from "../../../../../../../components/draft/paragraph/paragraph"
import { SectionFooter } from "../index"

describe("SectionFooter", () => {
  let props

  beforeEach(() => {
    props = {
      article: cloneDeep(FeatureArticle),
      isEditorial: true,
      onChangeArticleAction: jest.fn(),
    }
  })

  const getWrapper = passedProps => {
    return mount(<SectionFooter {...passedProps} />)
  }

  it("Shows a postscript field if channel hasFeature", () => {
    props.article.postscript = ""
    const component = getWrapper(props)

    expect(component.find(Paragraph).exists()).toBe(true)
    expect(component.text()).toMatch("Postscript (optional)")
  })

  it("Does not a postscript field if channel does not hasFeature", () => {
    props.isEditorial = false
    const component = getWrapper(props)

    expect(component.find(Paragraph).exists()).toBe(false)
    expect(component.text()).not.toMatch("Postscript (optional)")
  })

  it("Can render a saved postscript", () => {
    const component = getWrapper(props)
    const postscript = (FeatureArticle && FeatureArticle.postscript) || ""
    const expectedPostscript = postscript.replace("<p>", "").replace("</p>", "")

    expect(component.html()).toMatch(expectedPostscript)
  })
})
