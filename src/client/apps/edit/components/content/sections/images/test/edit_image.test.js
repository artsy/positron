import React from "react"
import { cloneDeep, extend } from "lodash"
import { stripTags } from "underscore.string"
import { mount } from "enzyme"
import { Artwork } from "@artsy/reaction/dist/Components/Publishing/Sections/Artwork"
import { Image } from "@artsy/reaction/dist/Components/Publishing/Sections/Image"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { EditImage } from "../components/edit_image"
import { RemoveButton } from "client/components/remove_button"
import { Paragraph } from "client/components/draft/paragraph/paragraph"

describe("EditImage", () => {
  let props
  let artwork = extend(StandardArticle.sections[4].images[2], { date: "2015" })
  let image = StandardArticle.sections[4].images[0]

  const getWrapper = props => {
    return mount(<EditImage {...props} />)
  }

  beforeEach(() => {
    props = {
      image,
      article: cloneDeep(StandardArticle),
      section: cloneDeep(StandardArticle.sections[4]),
      index: 0,
      width: 200,
      onChangeSectionAction: jest.fn(),
    }
  })

  describe("Rendering", () => {
    it("renders an image", () => {
      const component = getWrapper(props)
      const srcToArray = props.image.url.split("%2F")
      const fileName = srcToArray[srcToArray.length - 1]
      const caption = stripTags(props.image.caption)

      expect(component.find(Image).exists()).toBe(true)
      expect(component.find("img").getElement().props.src).toMatch(fileName)
      expect(component.text()).toMatch(caption)
    })

    it("renders an artwork", () => {
      props.image = artwork
      const component = getWrapper(props)
      const srcToArray = artwork.image.split("/")
      const fileName = srcToArray[srcToArray.length - 1]

      expect(component.find(Artwork).exists()).toBe(true)
      expect(component.text()).toMatch(artwork.date)
      expect(component.text()).toMatch(artwork.artists[0].name)
      expect(component.text()).toMatch(artwork.partner.name)
      expect(component.find("img").getElement().props.src).toMatch(fileName)
    })
  })

  describe("Dimensions", () => {
    it("Sets the container width to props.width if multiple images", () => {
      const component = getWrapper(props)
      const imageContainer = component
        .find(".EditImage")
        .first()
        .getElement().props

      expect(imageContainer.width).toBe(props.width + "px")
    })

    it("Sets the container width to 100% if single image and not classic", () => {
      props.section.images = [props.image]
      const component = getWrapper(props)
      const imageContainer = component
        .find(".EditImage")
        .first()
        .getElement().props

      expect(imageContainer.width).toBe("100%")
    })
  })

  describe("Caption", () => {
    it("if image, renders an editable caption with placeholder", () => {
      props.image.caption = ""
      const component = getWrapper(props)

      expect(component.find(Paragraph).exists()).toBe(true)
      expect(component.html()).toMatch(
        'class="public-DraftEditorPlaceholder-root"'
      )
    })

    it("#onCaptionChange can change an image caption", () => {
      const component = getWrapper(props)
      const newCaption = "<p>New Caption</p>"

      component.instance().onCaptionChange(newCaption)
      expect(
        props.onChangeSectionAction.mock.calls[0][1][props.index].caption
      ).toBe(newCaption)
    })

    it("if artwork, does not render editable caption", () => {
      props.image = artwork
      const component = getWrapper(props)

      expect(component.find(Paragraph).exists()).toBe(false)
    })
  })

  describe("Remove Image", () => {
    it("hides the remove button when not editing", () => {
      const component = getWrapper(props)

      expect(component.find(RemoveButton).exists()).toBe(false)
    })

    it("renders the remove button if editing and props.removeItem", () => {
      props.editing = true
      const component = getWrapper(props)

      expect(component.find(RemoveButton).exists()).toBe(true)
    })

    xit("calls removeItem when clicking remove icon", () => {
      props.editing = true
      const component = getWrapper(props)
      component
        .find(RemoveButton)
        .first()
        .simulate("click")

      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("images")
      expect(props.onChangeSectionAction.mock.calls[0][1].length).toBe(
        props.section.images.length - 1
      )
      expect(
        props.onChangeSectionAction.mock.calls[0][1][props.index].url
      ).not.toBe(props.image.url)
    })
  })
})
