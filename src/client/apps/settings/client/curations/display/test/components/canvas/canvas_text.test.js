import React from "react"
import { CanvasText } from "../../../components/canvas/canvas_text"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import { mount } from "enzyme"

describe("Canvas Text", () => {
  const getWrapper = props => {
    return mount(<CanvasText {...props} />)
  }

  let props
  const getProps = () => {
    props = {
      campaign: {
        canvas: { assets: [] },
        panel: { assets: [] },
      },
      index: 0,
      onChange: jest.fn(),
    }
  }

  beforeEach(getProps)

  it("Can save an edited headline", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(0)
    input.simulate("change", { target: { value: "New Headline" } })

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.headline")
    expect(props.onChange.mock.calls[0][1]).toMatch("New Headline")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it("Can save an edited overlay body", () => {
    props.campaign.canvas.layout = "overlay"
    const component = getWrapper(props)
    component
      .find(PlainText)
      .at(0)
      .getElement()
      .props.onChange("New Body")

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.headline")
    expect(props.onChange.mock.calls[0][1]).toMatch("New Body")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it("Can save an edited CTA Text", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(1)
    input.simulate("change", { target: { value: "Read More" } })

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.link.text")
    expect(props.onChange.mock.calls[0][1]).toMatch("Read More")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it("Can save an edited CTA Link", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(2)
    input.simulate("change", { target: { value: "http://artsy.net" } })

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.link.url")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://artsy.net")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it("Can save an edited Pixel Tracking Code", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(3)
    input.simulate("change", { target: { value: "a pixel tracking script" } })

    expect(props.onChange.mock.calls[0][0]).toMatch(
      "canvas.pixel_tracking_code"
    )
    expect(props.onChange.mock.calls[0][1]).toMatch("a pixel tracking script")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it("Can save an edited Disclaimer", () => {
    const component = getWrapper(props)
    component
      .find(PlainText)
      .instance()
      .props.onChange("New Disclaimer")

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.disclaimer")
    expect(props.onChange.mock.calls[0][1]).toMatch("New Disclaimer")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })
})
