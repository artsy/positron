import Backbone from "backbone"
import React from "react"
import { mount } from "enzyme"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { SeriesAdmin } from "../components/series"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"

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

  beforeEach(() => {
    props = {
      curation,
      onChange: jest.fn(),
    }
  })

  it("renders all fields", () => {
    const component = mount(<SeriesAdmin {...props} />)
    expect(component.find(ImageUpload).length).toBe(5)
    expect(component.find(Paragraph).length).toBe(1)
    expect(
      component
        .find("input")
        .at(2)
        .props().placeholder
    ).toMatch("http://example.com")
  })

  it("renders saved data", () => {
    curation.set({
      about: "<p>Sample about text</p>",
      partner_link_url: "http://gucci.com",
      partner_logo_primary: "http://gucci-logo-header.jpg",
      partner_logo_secondary: "http://gucci-logo-footer.jpg",
    })
    const component = mount(<SeriesAdmin {...props} />)
    expect(component.text()).toMatch("Sample about text")
    expect(component.html()).toMatch("gucci-logo-header.jpg")
    expect(component.html()).toMatch("gucci-logo-footer.jpg")
    expect(
      component
        .find("input")
        .at(2)
        .props().defaultValue
    ).toMatch("http://gucci.com")
  })

  it("Updates about section on input", () => {
    const component = mount(<SeriesAdmin {...props} />)
    component
      .find(Paragraph)
      .getElement()
      .props.onChange("About this series")
    expect(props.onChange.mock.calls[0][0]).toMatch("about")
    expect(props.onChange.mock.calls[0][1]).toMatch("About this series")
  })

  it("Updates partner link on input", () => {
    const component = mount(<SeriesAdmin {...props} />)
    const input = component.find("input").at(2)
    input.simulate("change", { target: { value: "http://link.com" } })

    expect(props.onChange.mock.calls[0][0]).toMatch("partner_link_url")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://link.com")
  })

  it("Updates primary logo on upload", () => {
    const component = mount(<SeriesAdmin {...props} />)
    const input = component
      .find(ImageUpload)
      .at(0)
      .getElement()
    input.props.onChange(input.props.name, "http://new-logo.jpg")

    expect(props.onChange.mock.calls[0][0]).toMatch("partner_logo_primary")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://new-logo.jpg")
  })

  it("Updates secondary logo on upload", () => {
    const component = mount(<SeriesAdmin {...props} />)
    const input = component
      .find(ImageUpload)
      .at(1)
      .getElement()
    input.props.onChange(input.props.name, "http://new-logo.jpg")

    expect(props.onChange.mock.calls[0][0]).toMatch("partner_logo_secondary")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://new-logo.jpg")
  })
})
