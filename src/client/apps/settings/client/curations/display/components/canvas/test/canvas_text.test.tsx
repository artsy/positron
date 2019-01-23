import { Input } from "@artsy/reaction/dist/Components/Input"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import { mount } from "enzyme"
import React from "react"
import { CanvasText } from "../canvas_text"

describe("Canvas Text", () => {
  const getWrapper = (passedProps = props) => {
    return mount(<CanvasText {...passedProps} />)
  }

  let props
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

  it("Can save an edited headline", () => {
    const component = getWrapper(props)
    const input = component
      .find(Input)
      .at(0)
      .instance() as Input

    const event = ({
      currentTarget: {
        value: "New Headline",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

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
    const input = component
      .find(Input)
      .at(1)
      .instance() as Input

    const event = ({
      currentTarget: {
        value: "Read More",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.link.text")
    expect(props.onChange.mock.calls[0][1]).toMatch("Read More")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it("Can save an edited CTA Link", () => {
    const component = getWrapper(props)
    const input = component
      .find(Input)
      .at(2)
      .instance() as Input

    const event = ({
      currentTarget: {
        value: "http://artsy.net",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("canvas.link.url")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://artsy.net")
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it("Can save an edited Pixel Tracking Code", () => {
    const component = getWrapper(props)
    const input = component
      .find(Input)
      .at(3)
      .instance() as Input

    const event = ({
      currentTarget: {
        value: "a pixel tracking script",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

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
