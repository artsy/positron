import { Checkbox } from "@artsy/palette"
import { Button as ButtonGroupButton } from "client/apps/edit/components/admin/components/article/index"

import {
  UnitCanvasImage,
  UnitCanvasOverlay,
  UnitCanvasSlideshow,
} from "@artsy/reaction/dist/Components/Publishing/Fixtures/Components"
import { CharacterLimit } from "client/components/character_limit"
import { mount } from "enzyme"
import React from "react"
import { CanvasControls } from "../canvas_controls"
import { CanvasImages } from "../canvas_images"
import { CanvasText } from "../canvas_text"
import { Canvas } from "../index"

describe("Canvas", () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(<Canvas {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      campaign: {
        canvas: { assets: [] },
        panel: { assets: [] },
      },
      index: 0,
      onChange: jest.fn(),
    }
  })

  it("Renders layout controls and input components", () => {
    const component = getWrapper()
    expect(component.find(CanvasControls).length).toBe(1)
    expect(component.find(ButtonGroupButton).length).toBe(3)
    expect(component.find(CanvasText).length).toBe(1)
    expect(component.find(CanvasImages).length).toBe(1)
  })

  it("Sets the canvas layout to overlay by default", () => {
    const component = getWrapper()
    expect(
      component
        .find(ButtonGroupButton)
        .at(0)
        .props().color
    ).toBe("black100")
  })

  it("Sets the canvas cover overlay correctly", () => {
    const component = getWrapper()
    component
      .find(Checkbox)
      .at(0)
      .simulate("click", { target: { checked: true } })

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.has_cover_overlay")
    expect(props.onChange.mock.calls[0][1]).toBe(true)
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Changes the canvas layout on button click", () => {
    const component = getWrapper()
    component
      .find(ButtonGroupButton)
      .at(2)
      .simulate("click")
    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.layout")
    expect(props.onChange.mock.calls[0][1]).toMatch("slideshow")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  describe("Overlay", () => {
    beforeEach(() => {
      props.campaign.canvas = UnitCanvasOverlay
    })

    it("Renders all fields", () => {
      const component = getWrapper()
      expect(component.find(CharacterLimit).length).toBe(3)
      expect(component.find('input[type="file"]').length).toBe(2)
      expect(component.find(Checkbox).length).toBe(1)
      expect(component.text()).toMatch("Body")
      expect(component.text()).toMatch("CTA Text")
      expect(component.text()).toMatch("CTA Link")
      expect(component.text()).toMatch("Disclaimer (optional)")
      expect(component.text()).toMatch("Pixel Tracking Code (optional)")
      expect(component.text()).toMatch("Background Image")
      expect(component.text()).toMatch("Logo")
    })

    it("Renders saved data", () => {
      const component = getWrapper()
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
    beforeEach(() => {
      props.campaign.canvas = UnitCanvasImage
      props.campaign.canvas.pixel_tracking_code = "pixel tracking script"
    })

    it("Renders all fields", () => {
      const component = getWrapper()
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
      const component = getWrapper()
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
      const component = getWrapper()
      expect(component.html()).toMatch('<video src="http://video.mp4">')
    })
  })

  describe("Slideshow", () => {
    beforeEach(() => {
      props.campaign.canvas = UnitCanvasSlideshow
      props.campaign.canvas.pixel_tracking_code = "pixel tracking script"
    })

    it("Renders all fields", () => {
      const component = getWrapper()
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
      const component = getWrapper()
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
