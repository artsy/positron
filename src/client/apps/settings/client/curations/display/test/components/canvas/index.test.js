import React from "react"
import { Canvas } from "../../../components/canvas/index.jsx"
import { CanvasControls } from "../../../components/canvas/canvas_controls.jsx"
import { CanvasImages } from "../../../components/canvas/canvas_images.jsx"
import { CanvasText } from "../../../components/canvas/canvas_text.jsx"
import { CharacterLimit } from "/client/components/character_limit"
import { mount } from "enzyme"
import {
  UnitCanvasImage,
  UnitCanvasOverlay,
  UnitCanvasSlideshow,
} from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"

describe("Canvas", () => {
  const props = {
    campaign: {
      canvas: { assets: [] },
      panel: { assets: [] },
    },
    index: 0,
    onChange: jest.fn(),
  }

  it("Renders layout controls and input components", () => {
    const component = mount(<Canvas {...props} />)
    expect(component.find(CanvasControls).length).toBe(1)
    expect(
      component.find(".display-admin--canvas__layouts button").length
    ).toBe(3)
    expect(component.find(CanvasText).length).toBe(1)
    expect(component.find(CanvasImages).length).toBe(1)
  })

  it("Sets the canvas layout to overlay by default", () => {
    const component = mount(<Canvas {...props} />)
    expect(
      component
        .find(".display-admin--canvas__layouts button")
        .at(0)
        .props()["data-active"]
    ).toBe(true)
  })

  it("Changes the canvas layout on button click", () => {
    const component = mount(<Canvas {...props} />)
    component
      .find(".display-admin--canvas__layouts button")
      .at(2)
      .simulate("click")
    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.layout")
    expect(props.onChange.mock.calls[0][1]).toMatch("slideshow")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  describe("Overlay", () => {
    it("Renders all fields", () => {
      props.campaign.canvas = UnitCanvasOverlay
      const component = mount(<Canvas {...props} />)
      expect(component.find(CharacterLimit).length).toBe(3)
      expect(component.find('input[type="file"]').length).toBe(2)
      expect(component.text()).toMatch("Body")
      expect(component.text()).toMatch("CTA Text")
      expect(component.text()).toMatch("CTA Link")
      expect(component.text()).toMatch("Disclaimer (optional)")
      expect(component.text()).toMatch("Pixel Tracking Code (optional)")
      expect(component.text()).toMatch("Background Image")
      expect(component.text()).toMatch("Logo")
    })

    it("Renders saved data", () => {
      const component = mount(<Canvas {...props} />)
      expect(component.text()).toMatch(props.campaign.canvas.headline)
      expect(component.html()).toMatch(props.campaign.canvas.link.text)
      expect(component.html()).toMatch(props.campaign.canvas.link.url)
      expect(component.text()).toMatch(props.campaign.canvas.disclaimer)
      expect(component.html()).toMatch(
        "artsy_logo_full_whiteweb_transparent.png"
      )
      expect(component.html()).toMatch("Rachel_Rossin_portrait_2.jpg")
    })
  })

  describe("Standard", () => {
    it("Renders all fields", () => {
      props.campaign.canvas = UnitCanvasImage
      const component = mount(<Canvas {...props} />)
      expect(component.find(CharacterLimit).length).toBe(3)
      expect(component.find('input[type="file"]').length).toBe(2)
      expect(component.html()).toMatch(
        'accept="image/jpg,image/jpeg,image/gif,image/png,video/mp4"'
      )
      expect(component.text()).toMatch("Headline")
      expect(component.text()).toMatch("CTA Text")
      expect(component.text()).toMatch("CTA Link")
      expect(component.text()).toMatch("Disclaimer (optional)")
      expect(component.text()).toMatch("Pixel Tracking Code (optional)")
      expect(component.text()).toMatch("Image / Video")
      expect(component.text()).toMatch("Logo")
    })

    it("Renders saved data", () => {
      props.campaign.canvas.pixel_tracking_code = "pixel tracking script"
      const component = mount(<Canvas {...props} />)
      expect(component.html()).toMatch(props.campaign.canvas.headline)
      expect(component.html()).toMatch(props.campaign.canvas.link.text)
      expect(component.html()).toMatch(props.campaign.canvas.link.url)
      expect(component.text()).toMatch(props.campaign.canvas.disclaimer)
      expect(component.html()).toMatch(
        props.campaign.canvas.pixel_tracking_code
      )
      expect(component.html()).toMatch("artsy-logo-wide-black.png")
      expect(component.html()).toMatch("Rachel_Rossin_portrait_2.jpg")
    })

    it("Can render a video file", () => {
      props.campaign.canvas.assets[0].url = "http://video.mp4"
      const component = mount(<Canvas {...props} />)
      expect(component.html()).toMatch('<video src="http://video.mp4">')
    })
  })

  describe("Slideshow", () => {
    it("Renders all fields", () => {
      props.campaign.canvas = UnitCanvasSlideshow
      const component = mount(<Canvas {...props} />)
      expect(component.find(CharacterLimit).length).toBe(3)
      expect(component.find('input[type="file"]').length).toBe(6)
      expect(component.text()).toMatch("Headline")
      expect(component.text()).toMatch("CTA Text")
      expect(component.text()).toMatch("CTA Link")
      expect(component.text()).toMatch("Disclaimer (optional)")
      expect(component.text()).toMatch("Pixel Tracking Code (optional)")
      expect(component.text()).toMatch("Image 1")
      expect(component.text()).toMatch("Image 2")
      expect(component.text()).toMatch("Logo")
    })

    it("Renders saved data", () => {
      props.campaign.canvas.pixel_tracking_code = "pixel tracking script"
      const component = mount(<Canvas {...props} />)
      expect(component.html()).toMatch(props.campaign.canvas.headline)
      expect(component.html()).toMatch(props.campaign.canvas.link.text)
      expect(component.html()).toMatch(props.campaign.canvas.link.url)
      expect(component.text()).toMatch(props.campaign.canvas.disclaimer)
      expect(component.html()).toMatch(
        props.campaign.canvas.pixel_tracking_code
      )
      expect(component.html()).toMatch("artsy-logo-wide-black.png")
      expect(component.html()).toMatch("Rachel_Rossin_portrait_2.jpg")
      expect(component.html()).toMatch("larger.jpg")
    })
  })
})
