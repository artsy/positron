import { Input } from "@artsy/reaction/dist/Components/Input"
import TextArea from "@artsy/reaction/dist/Components/TextArea"
import { mount } from "enzyme"
import React from "react"
import { Metadata } from "../components/metadata"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

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

  const getWrapper = (passedProps = props) => {
    return mount(<Metadata {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      section,
      onChange: jest.fn(),
    }
  })

  it("renders all fields", () => {
    const component = getWrapper()
    expect(component.find(ImageUpload).length).toBe(3)
    expect(component.find("input").length).toBe(8)
    expect(component.find("textarea").length).toBe(2)
  })

  it("renders saved data", () => {
    const component = getWrapper()
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

  it("can change social title", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(0)
      .props()

    const event = ({
      currentTarget: {
        value: "Social Title",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange && input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("social_title")
    expect(props.onChange.mock.calls[0][1]).toMatch("Social Title")
  })

  it("can change email title", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(1)
      .props()

    const event = ({
      currentTarget: {
        value: "Email Title",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange && input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("email_title")
    expect(props.onChange.mock.calls[0][1]).toMatch("Email Title")
  })

  it("can change email author", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(2)
      .props()

    const event = ({
      currentTarget: {
        value: "Email Author",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange && input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("email_author")
    expect(props.onChange.mock.calls[0][1]).toMatch("Email Author")
  })

  it("can change email tags", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(3)
      .props()

    const event = ({
      currentTarget: {
        value: "Email Tags",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange && input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("email_tags")
    expect(props.onChange.mock.calls[0][1]).toMatch("Email Tags")
  })

  it("can change keywords", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(4)
      .props()

    const event = ({
      currentTarget: {
        value: "Keywords",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange && input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("keywords")
    expect(props.onChange.mock.calls[0][1]).toMatch("Keywords")
  })

  it("can change description", () => {
    const component = getWrapper()
    const event = ({
      currentTarget: {
        value: "Description",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>

    component
      .find(TextArea)
      .at(0)
      .props()
      // @ts-ignore - FIXME
      .onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("description")
    expect(props.onChange.mock.calls[0][1]).toMatch("Description")
  })

  it("can change social description", () => {
    const component = getWrapper()
    const event = ({
      currentTarget: {
        value: "Social Description",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>

    component
      .find(TextArea)
      .at(1)
      .props()
      // @ts-ignore - FIXME
      .onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("social_description")
    expect(props.onChange.mock.calls[0][1]).toMatch("Social Description")
  })

  it("Updates section metadata images", () => {
    const component = getWrapper()
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
