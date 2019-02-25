import { Input } from "@artsy/reaction/dist/Components/Input"
import Backbone from "backbone"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { mount } from "enzyme"
import React from "react"
import { SeriesAdmin } from "../components/series"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

describe("Series Admin", () => {
  let props
  const curation = new Backbone.Model({
    name: "Gucci admin",
    type: "editorial-feature",
    sections: [],
    social_title: "What Happened in the Past?",
    social_description: "A series of films optimized for social media",
    email_title: "Good Morning, What Happened?",
    email_author: "Artsy Editors",
    email_tags: "magazine,article,gucci",
    keywords: "women,gender,equality",
    thumbnail_image: "http://thumbnail.jpg",
    email_image: "http://emailimage.jpg",
    social_image: "http://socialimage.jpg",
  })

  const getWrapper = (passedProps = props) => {
    return mount(<SeriesAdmin {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      curation,
      onChange: jest.fn(),
    }
  })

  it("renders all fields", () => {
    const component = getWrapper()
    expect(component.find(ImageUpload).length).toBe(5)
    expect(component.find(Paragraph).length).toBe(1)
    expect(component.find(Input).length).toBe(6)
  })

  it("renders saved data", () => {
    curation.set({
      about: "<p>Sample about text</p>",
      partner_link_url: "http://gucci.com",
      partner_logo_primary: "http://gucci-logo-header.jpg",
      partner_logo_secondary: "http://gucci-logo-footer.jpg",
    })
    const component = getWrapper()
    const logoHeader = component.find(ImageUpload).at(0)
    const logoFooter = component.find(ImageUpload).at(1)
    // @ts-ignore
    expect(logoHeader.props().src).toMatch("gucci-logo-header.jpg")
    // @ts-ignore
    expect(logoFooter.props().src).toMatch("gucci-logo-footer.jpg")
    expect(
      component
        .find(Paragraph)
        .at(0)
        .props().html
    ).toBe("<p>Sample about text</p>")
    expect(
      component
        .find(Input)
        .at(0)
        .props().defaultValue
    ).toMatch("http://gucci.com")
  })

  it("Updates about section on input", () => {
    const component = getWrapper()
    component
      .find(Paragraph)
      .getElement()
      .props.onChange("About this series")
    expect(props.onChange.mock.calls[0][0]).toMatch("about")
    expect(props.onChange.mock.calls[0][1]).toMatch("About this series")
  })

  it("Updates partner link on input", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(0)
      .props()
    const event = ({
      currentTarget: {
        value: "http://link.com",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange && input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("partner_link_url")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://link.com")
  })

  it("Updates primary logo on upload", () => {
    const component = getWrapper()
    const input = component
      .find(ImageUpload)
      .at(0)
      .getElement()
    input.props.onChange(input.props.name, "http://new-logo.jpg")

    expect(props.onChange.mock.calls[0][0]).toMatch("partner_logo_primary")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://new-logo.jpg")
  })

  it("Updates secondary logo on upload", () => {
    const component = getWrapper()
    const input = component
      .find(ImageUpload)
      .at(1)
      .getElement()
    input.props.onChange(input.props.name, "http://new-logo.jpg")

    expect(props.onChange.mock.calls[0][0]).toMatch("partner_logo_secondary")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://new-logo.jpg")
  })
})
