import { Input } from "@artsy/reaction/dist/Components/Input"
import { Fixtures } from "@artsy/reaction/dist/Components/Publishing"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { AdminSponsor } from "../sponsor"
const ImageUpload = require("../image_upload.coffee")

describe("EditAdmin", () => {
  let props

  const getWrapper = (passedProps = props) => {
    return mount(<AdminSponsor {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(Fixtures.StandardArticle),
      onChangeArticleAction: jest.fn(),
    }
  })

  describe("Sponsor Logos", () => {
    it("Renders file inputs", () => {
      const component = getWrapper()
      expect(component.find(ImageUpload).length).toBe(3)
      expect(component.text()).toMatch("Logo Light")
      expect(component.text()).toMatch("Logo Dark")
      expect(component.text()).toMatch("Logo Condensed")
    })

    it("Can render saved data", () => {
      props.article.sponsor = {
        partner_light_logo: "http://partner_light_logo.jpg",
        partner_dark_logo: "http://partner_dark_logo.jpg",
        partner_condensed_logo: "http://partner_condensed_logo.jpg",
      }
      const component = getWrapper(props)
      expect(component.html()).toMatch("partner_light_logo.jpg")
      expect(component.html()).toMatch("partner_dark_logo.jpg")
      expect(component.html()).toMatch("partner_condensed_logo.jpg")
    })

    it("Can add a light logo", () => {
      const component = getWrapper()
      const input = component
        .find(ImageUpload)
        .first()
        .getElement()
      input.props.onChange(input.props.name, "http://new-image.jpg")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("sponsor")
      expect(
        props.onChangeArticleAction.mock.calls[0][1].partner_light_logo
      ).toBe("http://new-image.jpg")
    })

    it("Can add a dark logo", () => {
      const component = getWrapper()
      const input = component
        .find(ImageUpload)
        .at(1)
        .getElement()
      input.props.onChange(input.props.name, "http://new-image.jpg")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("sponsor")
      expect(
        props.onChangeArticleAction.mock.calls[0][1].partner_dark_logo
      ).toBe("http://new-image.jpg")
    })

    it("Can add a condensed logo", () => {
      const component = getWrapper()
      const input = component
        .find(ImageUpload)
        .last()
        .getElement()
      input.props.onChange(input.props.name, "http://new-image.jpg")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("sponsor")
      expect(
        props.onChangeArticleAction.mock.calls[0][1].partner_condensed_logo
      ).toBe("http://new-image.jpg")
    })
  })

  describe("Sponsor Url", () => {
    it("Renders input", () => {
      const component = getWrapper()
      expect(
        component
          .find(Input)
          .at(0)
          .props().placeholder
      ).toMatch("http://example.com")
    })

    it("Can render saved data", () => {
      props.article.sponsor = { partner_logo_link: "http://partner.com" }
      const component = getWrapper(props)
      expect(
        component
          .find(Input)
          .at(0)
          .props().defaultValue
      ).toMatch("http://partner.com")
    })

    it("Calls props.onChangeArticleAction when input changes", () => {
      const component = getWrapper()
      const input = component
        .find(Input)
        .at(0)
        .instance() as Input

      const event = ({
        currentTarget: {
          value: "New URL",
        },
      } as unknown) as React.FormEvent<HTMLInputElement>
      input.onChange(event)

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("sponsor")
      expect(
        props.onChangeArticleAction.mock.calls[0][1].partner_logo_link
      ).toBe("New URL")
    })
  })

  describe("Sponsor Pixel Tracking Code", () => {
    it("Renders input", () => {
      const component = getWrapper()
      expect(
        component
          .find(Input)
          .at(1)
          .props().placeholder
      ).toMatch("Paste pixel tracking code here")
    })

    it("Can render saved data", () => {
      props.article.sponsor = { pixel_tracking_code: "tracking_image.jpg" }
      const component = getWrapper(props)

      expect(
        component
          .find(Input)
          .at(1)
          .props().defaultValue
      ).toMatch("tracking_image.jpg")
    })

    it("Calls props.onChangeArticleAction when input changes", () => {
      const component = getWrapper()
      const input = component
        .find(Input)
        .at(1)
        .instance() as Input

      const event = ({
        currentTarget: {
          value: "some_img.jpg",
        },
      } as unknown) as React.FormEvent<HTMLInputElement>
      input.onChange(event)

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("sponsor")
      expect(
        props.onChangeArticleAction.mock.calls[0][1].pixel_tracking_code
      ).toBe("some_img.jpg")
    })
  })
})
