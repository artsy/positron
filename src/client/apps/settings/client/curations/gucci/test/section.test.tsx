import { Checkbox } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import TextArea from "@artsy/reaction/dist/Components/TextArea"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { mount } from "enzyme"
import React from "react"
import { SectionAdmin } from "../components/section"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

describe("Section Admin", () => {
  let props
  const section = {
    title: "I. Past",
    featuring: "Rachel Uffner, Petra Collins, Narcissiter, Genevieve Gaignard",
    release_date: "2017-11-11T05:00:00.000Z",
    about: "<p>About this film...</p>",
    video_url: "http://youtube.com/movie",
    cover_image_url: "http://cover-image.jpg",
    published: true,
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
    return mount(<SectionAdmin {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      section,
      onChange: jest.fn(),
    }
  })

  it("renders all fields", () => {
    const component = getWrapper()
    expect(component.find(ImageUpload).length).toBe(4)
    expect(component.find(Paragraph).length).toBe(1)
    expect(component.find(Input).length).toBe(8)
    expect(component.find(TextArea).length).toBe(2)
    expect(component.find(Checkbox).length).toBe(1)
    expect(component.find('input[type="date"]').length).toBe(1)
  })

  it("renders saved data", () => {
    const component = getWrapper()
    const html = component.html()
    expect(
      component
        .find(Input)
        .first()
        .props().defaultValue
    ).toMatch("Rachel Uffner, Petra Collins, Narcissiter, Genevieve Gaignard")
    expect(component.text()).toMatch("About this film")
    expect(html).toMatch("cover-image.jpg")
    expect(html).toMatch("thumbnail.jpg")
    expect(html).toMatch("emailimage.jpg")
    expect(html).toMatch("socialimage.jpg")
    expect(
      component
        .find(Checkbox)
        .at(0)
        .props().selected
    ).toBe(true)
    expect(
      component
        .find(Input)
        .at(2)
        .props().defaultValue
    ).toMatch("http://youtube.com/movie")
    // FIXME TEST: Fragile date
    // expect(component.find('input[type="date"]').first().props().defaultValue).toMatch('2017-11-11')
  })

  it("Updates featuring section on input", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(0)
      .props()

    const event = ({
      currentTarget: {
        value:
          "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum.",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("featuring")
    expect(props.onChange.mock.calls[0][1]).toMatch(
      "Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum."
    )
  })

  it("Updates about section on input", () => {
    const component = getWrapper()
    component
      .find(Paragraph)
      .getElement()
      .props.onChange("About this video")

    expect(props.onChange.mock.calls[0][0]).toMatch("about")
    expect(props.onChange.mock.calls[0][1]).toMatch("About this video")
  })

  it("Updates release date and saves as iso", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(1)
      .props()

    const event = ({
      currentTarget: {
        value: "2017-11-15",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("release_date")
    expect(props.onChange.mock.calls[0][1]).toMatch("2017-11-15T")
  })

  it("Updates video url on input", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(2)
      .props()

    const event = ({
      currentTarget: {
        value: "http://vimeo.com/video",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChange.mock.calls[0][0]).toMatch("video_url")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://vimeo.com/video")
  })

  it("Updates cover image on upload", () => {
    const component = getWrapper()
    const input = component
      .find(ImageUpload)
      .at(0)
      .getElement()
    input.props.onChange(input.props.name, "http://cover-image.jpg")

    expect(props.onChange.mock.calls[0][0]).toMatch("cover_image_url")
    expect(props.onChange.mock.calls[0][1]).toMatch("http://cover-image.jpg")
  })

  it("Updates published on checkbox click", () => {
    const component = getWrapper()
    component
      .find(Checkbox)
      .first()
      .simulate("click")
    expect(props.onChange.mock.calls[0][0]).toMatch("published")
    expect(props.onChange.mock.calls[0][1]).toBe(false)
  })
})
