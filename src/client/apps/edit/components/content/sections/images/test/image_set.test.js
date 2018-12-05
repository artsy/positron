import { mount } from "enzyme"
import React from "react"
import { ImageSetPreview } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview"
import { ImageSetPreviewClassic } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview/ImageSetPreviewClassic"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { ImageSet } from "../components/image_set"

describe("ImageSet", () => {
  let props = {
    section: StandardArticle.sections[16],
  }

  const getWrapper = props => {
    return mount(<ImageSet {...props} />)
  }

  it("renders an image set for standard/feature articles", () => {
    props.articleLayout = "standard"
    const component = getWrapper(props)

    expect(component.find(ImageSetPreview).length).toBe(1)
    expect(component.find(ImageSetPreviewClassic).length).toBe(0)
  })

  it("renders an image set for classic articles", () => {
    props.articleLayout = "classic"
    const component = getWrapper(props)

    expect(component.find(ImageSetPreviewClassic).length).toBe(1)
    expect(component.find(ImageSetPreview).length).toBe(0)
  })
})
