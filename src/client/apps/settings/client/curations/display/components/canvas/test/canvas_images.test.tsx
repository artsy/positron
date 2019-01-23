import { FormLabel } from "client/components/form_label"
import { RemoveButtonContainer } from "client/components/remove_button"
import { mount } from "enzyme"
import React from "react"
import { CanvasImages } from "../canvas_images"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

describe("Canvas Images", () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(<CanvasImages {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      campaign: {
        canvas: {
          layout: "overlay",
          assets: [],
        },
      },
      index: 0,
      onChange: jest.fn(),
    }
  })

  describe("Overlay", () => {
    it("renders expected fields", () => {
      const component = getWrapper()
      expect(component.find(ImageUpload).length).toBe(2)
      expect(
        component
          .find(FormLabel)
          .at(0)
          .text()
      ).toMatch("Logo")
      expect(
        component
          .find(FormLabel)
          .at(1)
          .text()
      ).toMatch("Background Image")
      expect(
        component
          .find("input")
          .at(1)
          .props().accept
      ).not.toContain("video/mp4")
    })

    it("renders saved data", () => {
      props.campaign.canvas.logo = "http://artsy.net/logo.jpg"
      props.campaign.canvas.assets.push({ url: "http://artsy.net/image.jpg" })
      const component = getWrapper()
      const imgPreviewFirst = component.find(".image-upload-form-preview").at(0)
      const imgPreviewSecond = component
        .find(".image-upload-form-preview")
        .at(1)

      expect(
        component
          .find(ImageUpload)
          .at(0)
          // @ts-ignore
          .props().src
      ).toMatch(props.campaign.canvas.logo)
      // @ts-ignore
      expect(imgPreviewFirst.props().style.backgroundImage).toMatch("logo.jpg")
      expect(
        component
          .find(ImageUpload)
          .at(1)
          // @ts-ignore
          .props().src
      ).toMatch(props.campaign.canvas.assets[0].url)
      // @ts-ignore
      expect(imgPreviewSecond.props().style.backgroundImage).toMatch(
        "image.jpg"
      )
    })
  })

  describe("Standard", () => {
    it("renders expected fields", () => {
      props.campaign.canvas.layout = "standard"
      const component = getWrapper()
      expect(component.find(ImageUpload).length).toBe(2)
      expect(
        component
          .find(FormLabel)
          .at(0)
          .text()
      ).toMatch("Logo")
      expect(
        component
          .find(FormLabel)
          .at(1)
          .text()
      ).toMatch("Image / Video")
      expect(
        component
          .find("input")
          .at(1)
          .props().accept
      ).toContain("video/mp4")
    })

    it("renders saved data", () => {
      props.campaign.canvas.logo = "http://artsy.net/logo.jpg"
      props.campaign.canvas.assets = [{ url: "http://artsy.net/video.mp4" }]
      const component = getWrapper()
      const imgPreview = component.find(".image-upload-form-preview").at(0)
      expect(
        component
          .find(ImageUpload)
          .at(0)
          // @ts-ignore
          .props().src
      ).toMatch(props.campaign.canvas.logo)
      // @ts-ignore
      expect(imgPreview.props().style.backgroundImage).toMatch("logo.jpg")
      expect(
        component
          .find(ImageUpload)
          .at(1)
          // @ts-ignore
          .props().src
      ).toMatch(props.campaign.canvas.assets[0].url)
      expect(component.html()).toMatch(
        '<video src="http://artsy.net/video.mp4">'
      )
    })

    it("renders a cover image field if has video asset", () => {
      props.campaign.canvas.layout = "standard"
      props.campaign.canvas.assets = [{ url: "http://artsy.net/video.mp4" }]
      const component = getWrapper()

      expect(component.text()).toMatch("Video Cover Image")
      expect(component.find(ImageUpload).length).toBe(3)
    })

    it("can render saved cover image", () => {
      props.campaign.canvas.layout = "standard"
      props.campaign.canvas.cover_img_url = "http://artsy.net/cover_img.jpg"
      props.campaign.canvas.assets = [{ url: "http://artsy.net/video.mp4" }]
      const component = getWrapper()

      expect(component.html()).toMatch("cover_img.jpg")
    })
  })

  describe("Slideshow", () => {
    it("renders expected fields", () => {
      props.campaign.canvas.assets = []
      props.campaign.canvas.layout = "slideshow"
      const component = getWrapper()
      expect(component.find(ImageUpload).length).toBe(2)
      expect(
        component
          .find(FormLabel)
          .at(0)
          .text()
      ).toMatch("Logo")
      expect(
        component
          .find(FormLabel)
          .at(1)
          .text()
      ).toMatch("Image 1")
      expect(
        component
          .find("input")
          .at(1)
          .props().accept
      ).not.toContain("video/mp4")
    })

    it("renders saved data", () => {
      props.campaign.canvas.layout = "slideshow"
      props.campaign.canvas.logo = "http://artsy.net/logo.jpg"
      props.campaign.canvas.assets = [
        { url: "http://artsy.net/image1.jpg" },
        { url: "http://artsy.net/image2.jpg" },
      ]
      const component = getWrapper()
      const logoInput = component.find(ImageUpload).at(0)
      const logoPreview = component.find(".image-upload-form-preview").at(0)
      // @ts-ignore
      expect(logoInput.props().src).toMatch(props.campaign.canvas.logo)
      // @ts-ignore
      expect(logoPreview.props().style.backgroundImage).toMatch("logo.jpg")

      const imgFirst = component.find(ImageUpload).at(1)
      const imgFirstPreview = component.find(".image-upload-form-preview").at(1)
      // @ts-ignore
      expect(imgFirst.props().src).toMatch(props.campaign.canvas.assets[0].url)
      // @ts-ignore
      expect(imgFirstPreview.props().style.backgroundImage).toMatch(
        "image1.jpg"
      )

      const imgSecond = component.find(ImageUpload).at(2)
      const imgSecondPreview = component
        .find(".image-upload-form-preview")
        .at(2)
      // @ts-ignore
      expect(imgSecond.props().src).toMatch(props.campaign.canvas.assets[1].url)
      // @ts-ignore
      expect(imgSecondPreview.props().style.backgroundImage).toMatch(
        "image2.jpg"
      )
      expect(
        component
          .find(FormLabel)
          .at(2)
          .text()
      ).toMatch("Image 2")
    })
  })

  describe("Uploads", () => {
    describe("Logo", () => {
      it("Calls props.onChange on input change", () => {
        const component = getWrapper()
        const input = component
          .find(ImageUpload)
          .at(0)
          .getElement()
        input.props.onChange(input.props.name, "http://new-logo.jpg")
        const onChangeArgs = props.onChange.mock.calls[0]

        expect(onChangeArgs[0]).toMatch("canvas.logo")
        expect(onChangeArgs[1]).toMatch("http://new-logo.jpg")
        expect(onChangeArgs[2]).toBe(props.index)
      })

      it("Can remove an existing file", () => {
        props.campaign.canvas.logo = "http://artsy.net/logo.jpg"
        props.campaign.canvas.assets = [{ url: "http://artsy.net/image1.jpg" }]
        const component = getWrapper()
        component
          .find(RemoveButtonContainer)
          .at(0)
          .simulate("click")

        expect(props.onChange.mock.calls[0][0]).toMatch("canvas.logo")
        expect(props.onChange.mock.calls[0][2]).toBe(props.index)
      })
    })

    describe("Assets", () => {
      it("Calls props.onChange on image change", () => {
        props.campaign.canvas.assets = []
        props.campaign.canvas.layout = "standard"
        const component = getWrapper()
        const input = component
          .find(ImageUpload)
          .at(1)
          .getElement()
        input.props.onChange(input.props.name, "http://new-image.jpg")
        const onChangeArgs = props.onChange.mock.calls[0]

        expect(onChangeArgs[0]).toMatch("canvas.assets")
        expect(onChangeArgs[1][0].url).toMatch("http://new-image.jpg")
        expect(onChangeArgs[2]).toBe(props.index)
      })

      it("Replaces an existing image on change", () => {
        props.campaign.canvas.assets = [{ url: "http://image.jpg" }]
        const component = getWrapper()
        const input = component
          .find(ImageUpload)
          .at(1)
          .getElement()
        input.props.onChange(input.props.name, "http://new-image.jpg")
        const onChangeArgs = props.onChange.mock.calls[0]

        expect(onChangeArgs[0]).toMatch("canvas.assets")
        expect(onChangeArgs[1][0].url).toMatch("http://new-image.jpg")
        expect(onChangeArgs[2]).toBe(props.index)
      })

      it("Can remove an image", () => {
        props.campaign.canvas.logo = "http://artsy.net/logo.jpg"
        props.campaign.canvas.assets = [{ url: "http://artsy.net/image1.jpg" }]
        const component = getWrapper()
        component
          .find(RemoveButtonContainer)
          .at(1)
          .simulate("click")
        const onChangeArgs = props.onChange.mock.calls[0]

        expect(onChangeArgs[0]).toMatch("canvas.assets")
        expect(onChangeArgs[1].length).toBe(0)
        expect(onChangeArgs[2]).toBe(props.index)
      })

      it("Can add additional images if slideshow", () => {
        props.campaign.canvas.layout = "slideshow"
        props.campaign.canvas.assets = [{ url: "http://image1.jpg" }]
        const component = getWrapper()
        const input = component
          .find(ImageUpload)
          .at(2)
          .getElement()
        input.props.onChange(input.props.name, "http://image2.jpg")
        const onChangeArgs = props.onChange.mock.calls[0]

        expect(onChangeArgs[0]).toMatch("canvas.assets")
        expect(onChangeArgs[1][0].url).toMatch("http://image1.jpg")
        expect(onChangeArgs[1][1].url).toMatch("http://image2.jpg")
        expect(onChangeArgs[2]).toBe(props.index)
      })
    })
  })
})
