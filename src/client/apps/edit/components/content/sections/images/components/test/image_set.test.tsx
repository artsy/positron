import { ImageSetFull } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"
import { ImageSetPreview } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview"
import { ImageSetPreviewClassic } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview/ImageSetPreviewClassic"
import { mount } from "enzyme"
import React from "react"
import { ImageSet, ImageSetProps } from "../image_set"

describe("ImageSet", () => {
  const props: ImageSetProps = {
    articleLayout: "standard",
    section: ImageSetFull,
  }

  const getWrapper = (passedProps = props) => {
    return mount(<ImageSet {...passedProps} />)
  }

  it("renders an image set for standard/feature articles", () => {
    const component = getWrapper()

    expect(component.find(ImageSetPreview).length).toBe(1)
    expect(component.find(ImageSetPreviewClassic).length).toBe(0)
  })

  it("renders an image set for classic articles", () => {
    props.articleLayout = "classic"
    const component = getWrapper()

    expect(component.find(ImageSetPreviewClassic).length).toBe(1)
    expect(component.find(ImageSetPreview).length).toBe(0)
  })
})
