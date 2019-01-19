import { Input } from "@artsy/reaction/dist/Components/Input"
import { CharacterLimit } from "client/components/character_limit"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { FormLabel } from "client/components/form_label"
import { mount } from "enzyme"
import React from "react"
import { Panel } from "../index"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

const globalAny: any = global
globalAny.window.getSelection = jest.fn(() => {
  return {
    isCollapsed: true,
    getRangeAt: jest.fn(),
  }
})

describe("Panel", () => {
  let props

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

  const getWrapper = (passedProps = props) => {
    return mount(<Panel {...passedProps} />)
  }

  it("renders all fields", () => {
    const component = getWrapper()
    expect(component.find(Input).length).toBe(3)
    expect(component.find(CharacterLimit).length).toBe(2)
    expect(component.find(ImageUpload).length).toBe(2)
  })

  it("renders saved text data", () => {
    props.campaign.panel = {
      assets: [{ url: "http://artsy.net/image.jpg" }],
      body: '<p>Sample body text. <a href="http://artsy.net">Example link</a>.',
      headline: "Sample Headline",
      link: { url: "http://artsy.net" },
      logo: "http://artsy.net/logo.jpg",
      pixel_tracking_code: "pixel tracking code",
    }
    const component = getWrapper(props)

    const headlineLabel = component.find(FormLabel).at(1)
    expect(headlineLabel.text()).toMatch("10 Characters")

    const headline = component.find("input").at(0)
    expect(headline.props().defaultValue).toMatch(props.campaign.panel.headline)

    const linkUrl = component.find("input").at(1)
    expect(linkUrl.props().defaultValue).toMatch(props.campaign.panel.link.url)

    const body = component.find(Paragraph).at(0)
    expect(body.text()).toMatch("Sample body text.")
    expect(body.text()).toMatch("Example link")
    expect(body.html()).toMatch('<a href="http://artsy.net/">')

    const trackingCode = component.find("input").at(2)
    expect(trackingCode.props().defaultValue).toMatch(
      props.campaign.panel.pixel_tracking_code
    )
  })

  it("Calls props.onChange on headline change", () => {
    const component = getWrapper()
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

    expect(props.onChange.mock.calls[0][0]).toMatch("panel.headline")
    expect(props.onChange.mock.calls[0][1]).toMatch("New Headline")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Calls props.onChange on CTA link change", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(1)
      .instance() as Input
    const event = ({
      currentTarget: {
        value: "http://new-link.com",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("panel.link.url")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://new-link.com")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Calls props.onChange on pixel_tracking_code change", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(2)
      .instance() as Input
    const event = ({
      currentTarget: {
        value: "new tracking code",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("panel.pixel_tracking_code")
    expect(props.onChange.mock.calls[0][1]).toMatch("new tracking code")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it("Calls props.onChange on body change", () => {
    const component = getWrapper()
    const characterLimit = component
      .find(CharacterLimit)
      .at(1)
      .instance() as CharacterLimit
    characterLimit.onChange("new value")

    expect(props.onChange.mock.calls[0][0]).toMatch("panel.body")
    expect(props.onChange.mock.calls[0][1]).toMatch("new value")
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })
})
