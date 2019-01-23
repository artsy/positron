import { FormLabel } from "client/components/form_label"
import { mount } from "enzyme"
import React from "react"
import { PanelImages } from "../panel_images"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

const globalAny: any = global
globalAny.window.getSelection = jest.fn(() => {
  return {
    isCollapsed: true,
    getRangeAt: jest.fn(),
  }
})

describe("PanelImages", () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(<PanelImages {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      campaign: {
        canvas: {},
        panel: {},
      },
      index: 0,
      onChange: jest.fn(),
    }
  })

  it("renders all fields", () => {
    const component = getWrapper()
    expect(component.find(ImageUpload).length).toBe(2)
    expect(
      component
        .find(FormLabel)
        .at(0)
        .text()
    ).toMatch("Image / Video")
    expect(
      component
        .find(FormLabel)
        .at(1)
        .text()
    ).toMatch("Logo")
  })

  it("renders saved image data", () => {
    props.campaign.panel = {
      assets: [{ url: "http://artsy.net/image.jpg" }],
      body: '<p>Sample body text. <a href="http://artsy.net">Example link</a>.',
      headline: "Sample Headline",
      link: { url: "http://artsy.net" },
      logo: "http://artsy.net/logo.jpg",
    }
    const component = getWrapper()
    const imageUpload = component.find(ImageUpload).at(0)
    const imagePreview = component.find(".image-upload-form-preview").at(0)
    const logoUpload = component.find(ImageUpload).at(1)
    const logoPreview = component.find(".image-upload-form-preview").at(1)

    // TODO: convert ImageUpload to ts
    // @ts-ignore
    expect(imageUpload.props().src).toMatch(props.campaign.panel.assets[0].url)
    // @ts-ignore
    expect(imagePreview.props().style.backgroundImage).toMatch("image.jpg")
    // @ts-ignore
    expect(logoUpload.props().src).toMatch(props.campaign.panel.logo)
    // @ts-ignore
    expect(logoPreview.props().style.backgroundImage).toMatch("logo.jpg")
  })

  it("renders cover image field if asset is video", () => {
    props.campaign.panel = {
      assets: [{ url: "http://artsy.net/video.mp4" }],
    }
    const component = getWrapper()
    expect(
      component
        .find(FormLabel)
        .at(1)
        .text()
    ).toMatch("Cover Image")
    expect(
      component
        .find(ImageUpload)
        .at(1)
        // @ts-ignore
        .props().name
    ).toMatch("panel.cover_img_url")
  })

  it("Calls props.onChange on image change", () => {
    const component = getWrapper()
    const input = component
      .find(ImageUpload)
      .at(0)
      .getElement()

    input.props.onChange(input.props.name, "http://new-image.jpg")
    expect(props.onChange.mock.calls[0][0]).toMatch("panel.assets")
    expect(props.onChange.mock.calls[0][1][0].url).toMatch(
      "http://new-image.jpg"
    )
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })
})
