import React from "react"
import { PanelImages } from "../../../components/panel/panel_images.jsx"
import { mount } from "enzyme"

import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"

global.window.getSelection = jest.fn(() => {
  return {
    isCollapsed: true,
    getRangeAt: jest.fn(),
  }
})

describe("PanelImages", () => {
  const props = {
    campaign: {
      canvas: {},
      panel: {},
    },
    index: 0,
    onChange: jest.fn(),
  }

  it("renders all fields", () => {
    const component = mount(<PanelImages {...props} />)
    expect(component.find(ImageUpload).length).toBe(2)
    expect(
      component
        .find("label")
        .at(0)
        .text()
    ).toMatch("Image / Video")
    expect(
      component
        .find("label")
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
    const component = mount(<PanelImages {...props} />)
    expect(
      component
        .find(ImageUpload)
        .at(0)
        .props().src
    ).toMatch(props.campaign.panel.assets[0].url)
    expect(
      component
        .find(".image-upload-form-preview")
        .at(0)
        .props().style.backgroundImage
    ).toMatch("image.jpg")
    expect(
      component
        .find(ImageUpload)
        .at(1)
        .props().src
    ).toMatch(props.campaign.panel.logo)
    expect(
      component
        .find(".image-upload-form-preview")
        .at(1)
        .props().style.backgroundImage
    ).toMatch("logo.jpg")
  })

  it("renders cover image field if asset is video", () => {
    props.campaign.panel = {
      assets: [{ url: "http://artsy.net/video.mp4" }],
    }
    const component = mount(<PanelImages {...props} />)
    expect(
      component
        .find("label")
        .at(1)
        .text()
    ).toMatch("Cover Image")
    expect(
      component
        .find(ImageUpload)
        .at(1)
        .props().name
    ).toMatch("panel.cover_img_url")
  })

  it("Calls props.onChange on image change", () => {
    const component = mount(<PanelImages {...props} />)
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
