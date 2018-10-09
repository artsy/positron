import { mount } from "enzyme"
import { Metadata } from "../components/metadata.jsx"
import React from "react"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"

describe("Metadata", () => {
  let props
  const section = {
    title: "I. Past",
    description: "General Description",
    social_title: "What Happened in the Past?",
    social_description: "A series of films optimized for social media",
    email_title: "Good Morning, What Happened?",
    email_author: "Artsy Editors",
    email_tags: "magazine,article,gucci",
    keywords: "women,gender,equality",
    thumbnail_image: "http://thumbnail.jpg",
    email_image: "http://emailimage.jpg",
    social_image: "http://socialimage.jpg",
  }

  beforeEach(() => {
    props = {
      section,
      onChange: jest.fn(),
    }
  })

  it("renders all fields", () => {
    const component = mount(<Metadata {...props} />)
    expect(component.find(ImageUpload).length).toBe(3)
    expect(component.find("input").length).toBe(8)
    expect(component.find("textarea").length).toBe(2)
  })

  it("renders saved data", () => {
    const component = mount(<Metadata {...props} />)
    const html = component.html()
    expect(html).toMatch("thumbnail.jpg")
    expect(html).toMatch("emailimage.jpg")
    expect(html).toMatch("socialimage.jpg")
    expect(
      component
        .find("input")
        .at(0)
        .props().defaultValue
    ).toBe("What Happened in the Past?")
    expect(
      component
        .find("textarea")
        .at(0)
        .props().defaultValue
    ).toBe("General Description")
    expect(
      component
        .find("textarea")
        .at(1)
        .props().defaultValue
    ).toBe("A series of films optimized for social media")
    expect(
      component
        .find("input")
        .at(1)
        .props().defaultValue
    ).toBe("Good Morning, What Happened?")
    expect(
      component
        .find("input")
        .at(2)
        .props().defaultValue
    ).toBe("Artsy Editors")
    expect(
      component
        .find("input")
        .at(3)
        .props().defaultValue
    ).toBe("magazine,article,gucci")
    expect(
      component
        .find("input")
        .at(4)
        .props().defaultValue
    ).toBe("women,gender,equality")
  })

  it("Updates section metadata inputs", () => {
    const component = mount(<Metadata {...props} />)
    const inputs = component.find("input")
    const textarea = component.find("textarea")
    inputs.at(0).simulate("change", { target: { value: "Social Title" } })
    inputs.at(1).simulate("change", { target: { value: "Email Title" } })
    inputs.at(2).simulate("change", { target: { value: "Email Author" } })
    inputs.at(3).simulate("change", { target: { value: "Email Tags" } })
    inputs.at(4).simulate("change", { target: { value: "Keywords" } })
    textarea.at(0).simulate("change", { target: { value: "Description" } })
    textarea
      .at(1)
      .simulate("change", { target: { value: "Social Description" } })

    expect(props.onChange.mock.calls[0][0]).toMatch("social_title")
    expect(props.onChange.mock.calls[0][1]).toMatch("Social Title")
    expect(props.onChange.mock.calls[1][0]).toMatch("email_title")
    expect(props.onChange.mock.calls[1][1]).toMatch("Email Title")
    expect(props.onChange.mock.calls[2][0]).toMatch("email_author")
    expect(props.onChange.mock.calls[2][1]).toMatch("Email Author")
    expect(props.onChange.mock.calls[3][0]).toMatch("email_tags")
    expect(props.onChange.mock.calls[3][1]).toMatch("Email Tags")
    expect(props.onChange.mock.calls[4][0]).toMatch("keywords")
    expect(props.onChange.mock.calls[4][1]).toMatch("Keywords")
    expect(props.onChange.mock.calls[5][0]).toMatch("description")
    expect(props.onChange.mock.calls[5][1]).toMatch("Description")
    expect(props.onChange.mock.calls[6][0]).toMatch("social_description")
    expect(props.onChange.mock.calls[6][1]).toMatch("Social Description")
  })

  it("Updates section metadata images", () => {
    const component = mount(<Metadata {...props} />)
    const thumbnailInput = component
      .find(ImageUpload)
      .at(0)
      .getElement()
    thumbnailInput.props.onChange(
      thumbnailInput.props.name,
      "thumbnailImage.jpg"
    )
    const socialInput = component
      .find(ImageUpload)
      .at(1)
      .getElement()
    socialInput.props.onChange(socialInput.props.name, "socialImage.jpg")
    const emailInput = component
      .find(ImageUpload)
      .at(2)
      .getElement()
    emailInput.props.onChange(emailInput.props.name, "emailImage.jpg")

    expect(props.onChange.mock.calls[0][0]).toMatch("thumbnail_image")
    expect(props.onChange.mock.calls[0][1]).toMatch("thumbnailImage.jpg")
    expect(props.onChange.mock.calls[1][0]).toMatch("social_image")
    expect(props.onChange.mock.calls[1][1]).toMatch("socialImage.jpg")
    expect(props.onChange.mock.calls[2][0]).toMatch("email_image")
    expect(props.onChange.mock.calls[2][1]).toMatch("emailImage.jpg")
  })
})
