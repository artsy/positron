import React from "react"
import { mount } from "enzyme"
import ImageUpload from "client/apps/edit/components/admin/components/image_upload.coffee"
import { CanvasImages } from "../../../components/canvas/canvas_images"
import {
  RemoveButton,
  RemoveButtonContainer,
} from "client/components/remove_button"

describe("Canvas Images", () => {
  let props

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
      const component = mount(<CanvasImages {...props} />)
      expect(component.html()).toMatch('data-layout="overlay"')
      expect(component.find(ImageUpload).length).toBe(2)
      expect(
        component
          .find("label")
          .at(0)
          .text()
      ).toMatch("Logo")
      expect(
        component
          .find("label")
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
      const component = mount(<CanvasImages {...props} />)
      expect(
        component
          .find(ImageUpload)
          .at(0)
          .props().src
      ).toMatch(props.campaign.canvas.logo)
      expect(
        component
          .find(".image-upload-form-preview")
          .at(0)
          .props().style.backgroundImage
      ).toMatch("logo.jpg")
      expect(
        component
          .find(ImageUpload)
          .at(1)
          .props().src
      ).toMatch(props.campaign.canvas.assets[0].url)
      expect(
        component
          .find(".image-upload-form-preview")
          .at(1)
          .props().style.backgroundImage
      ).toMatch("image.jpg")
    })
  })

  describe("Standard", () => {
    it("renders expected fields", () => {
      props.campaign.canvas.layout = "standard"
      const component = mount(<CanvasImages {...props} />)
      expect(component.html()).toMatch('data-layout="standard"')
      expect(component.find(ImageUpload).length).toBe(2)
      expect(
        component
          .find("label")
          .at(0)
          .text()
      ).toMatch("Logo")
      expect(
        component
          .find("label")
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
      const component = mount(<CanvasImages {...props} />)
      expect(
        component
          .find(ImageUpload)
          .at(0)
          .props().src
      ).toMatch(props.campaign.canvas.logo)
      expect(
        component
          .find(".image-upload-form-preview")
          .at(0)
          .props().style.backgroundImage
      ).toMatch("logo.jpg")
      expect(
        component
          .find(ImageUpload)
          .at(1)
          .props().src
      ).toMatch(props.campaign.canvas.assets[0].url)
      expect(component.html()).toMatch(
        '<video src="http://artsy.net/video.mp4">'
      )
    })
  })

  describe("Slideshow", () => {
    it("renders expected fields", () => {
      props.campaign.canvas.assets = []
      props.campaign.canvas.layout = "slideshow"
      const component = mount(<CanvasImages {...props} />)
      expect(component.html()).toMatch('data-layout="slideshow"')
      expect(component.find(ImageUpload).length).toBe(2)
      expect(
        component
          .find("label")
          .at(0)
          .text()
      ).toMatch("Logo")
      expect(
        component
          .find("label")
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
      const component = mount(<CanvasImages {...props} />)
      expect(
        component
          .find(ImageUpload)
          .at(0)
          .props().src
      ).toMatch(props.campaign.canvas.logo)
      expect(
        component
          .find(".image-upload-form-preview")
          .at(0)
          .props().style.backgroundImage
      ).toMatch("logo.jpg")
      expect(
        component
          .find(ImageUpload)
          .at(1)
          .props().src
      ).toMatch(props.campaign.canvas.assets[0].url)
      expect(
        component
          .find(".image-upload-form-preview")
          .at(1)
          .props().style.backgroundImage
      ).toMatch("image1.jpg")
      expect(
        component
          .find("label")
          .at(2)
          .text()
      ).toMatch("Image 2")
      expect(
        component
          .find(ImageUpload)
          .at(2)
          .props().src
      ).toMatch(props.campaign.canvas.assets[1].url)
      expect(
        component
          .find(".image-upload-form-preview")
          .at(2)
          .props().style.backgroundImage
      ).toMatch("image2.jpg")
    })
  })

  describe("Uploads", () => {
    describe("Logo", () => {
      it("Calls props.onChange on input change", () => {
        const component = mount(<CanvasImages {...props} />)
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
        const component = mount(<CanvasImages {...props} />)
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
        const component = mount(<CanvasImages {...props} />)
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
        const component = mount(<CanvasImages {...props} />)
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
        const component = mount(<CanvasImages {...props} />)
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
        const component = mount(<CanvasImages {...props} />)
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
