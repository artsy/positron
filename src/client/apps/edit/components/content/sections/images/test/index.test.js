import { clone } from "lodash"
import { mount, shallow } from "enzyme"
import React from "react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import { Artwork } from "@artsy/reaction/dist/Components/Publishing/Sections/Artwork"
import { Image } from "@artsy/reaction/dist/Components/Publishing/Sections/Image"
import { ImageSetPreview } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview"
import { ImageSetPreviewClassic } from "@artsy/reaction/dist/Components/Publishing/Sections/ImageSetPreview/ImageSetPreviewClassic"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import DragContainer from "client/components/drag_drop/index.coffee"
import { ProgressBar } from "client/components/file_input/progress_bar"
import { ImagesControls } from "../components/controls"
import { SectionImages } from "../index"
require("typeahead.js")

describe("SectionImageCollection", () => {
  let props
  let article
  let imageSection
  let imageSetSection
  let largeImageSetSection

  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {},
      },
      edit: {
        article: props.article,
        section: props.section,
      },
    })

    return mount(
      <Provider store={store}>
        <SectionImages {...props} />
      </Provider>
    )
  }

  const getShallowWrapper = props => {
    return shallow(<SectionImages {...props} />)
  }

  beforeEach(() => {
    article = clone(StandardArticle)
    imageSection = clone(StandardArticle.sections[4])
    imageSetSection = clone(StandardArticle.sections[14])
    largeImageSetSection = clone(StandardArticle.sections[14])
    largeImageSetSection.images.push(StandardArticle.sections[16].images[0])

    props = {
      article,
      editing: false,
      isHero: false,
      section: imageSection,
      onChangeSectionAction: jest.fn(),
    }
  })

  describe("Rendering", () => {
    it("Renders a preview for images/artworks", () => {
      const component = getWrapper(props)

      expect(component.find(Image).length).toBe(2)
      expect(component.find(Artwork).exists()).toBe(true)
    })

    it("Renders a preview for standard/feature image_set", () => {
      props.section = imageSetSection
      const component = getWrapper(props)

      expect(component.find(ImageSetPreview).exists()).toBe(true)
    })

    it("Renders a preview for classic image_set", () => {
      props.article.layout = "classic"
      props.section = imageSetSection
      const component = getWrapper(props)

      expect(component.find(ImageSetPreviewClassic).exists()).toBe(true)
    })

    it("Renders controls if editing", () => {
      props.editing = true
      const component = getWrapper(props)

      expect(component.find(ImagesControls).exists()).toBe(true)
    })

    it("Renders a placeholder if editing and no images", () => {
      props.section.images = []
      const component = getWrapper(props)

      expect(component.text()).toBe("Add images and artworks above")
    })

    it("Renders progress if state.progress", () => {
      props.editing = true
      const component = getShallowWrapper(props)
      component.setState({ progress: 0.65 })

      expect(component.find(ProgressBar).exists()).toBe(true)
    })
  })

  describe("Drag/drop", () => {
    it("Does not render draggable components if not editing", () => {
      const component = getWrapper(props)

      expect(component.find(DragContainer).exists()).toBe(false)
    })

    it("Does not render draggable components if single image", () => {
      props.editing = true
      props.section.images = [imageSection.images[0]]
      const component = getWrapper(props)

      expect(component.find(DragContainer).exists()).toBe(false)
    })

    it("Renders draggable components if more than one image and editing", () => {
      props.editing = true
      const component = getWrapper(props)

      expect(component.find(DragContainer).exists()).toBe(true)
    })

    it("#onDragEnd calls onChange with reset section images", () => {
      const component = getShallowWrapper(props)
      const newImages = props.section.images.reverse()

      component.instance().onDragEnd(newImages)

      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("images")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(newImages)
    })
  })

  describe("Container sizes", () => {
    it("#getContainerSizes returns sizes for overflow section in standard/feature articles", () => {
      const component = getShallowWrapper(props)
      const sizes = component.instance().getContainerSizes()

      expect(sizes.containerSize).toBe(780)
      expect(sizes.targetHeight).toBe(630)
    })

    it("#getContainerSizes returns sizes for column section in standard/feature articles", () => {
      props.section.layout = "column_width"
      const component = getShallowWrapper(props)
      const sizes = component.instance().getContainerSizes()

      expect(sizes.containerSize).toBe(680)
    })

    it("#getContainerSizes returns sizes for overflow section in classic articles", () => {
      props.article.layout = "classic"
      props.section.layout = "overflow_fillwidth"
      const component = getShallowWrapper(props)
      const sizes = component.instance().getContainerSizes()

      expect(sizes.containerSize).toBe(900)
      expect(sizes.targetHeight).toBe(630)
    })

    it("#getContainerSizes returns sizes for column section in classic articles", () => {
      props.article.layout = "classic"
      props.section.layout = "column_width"
      const component = getShallowWrapper(props)
      const sizes = component.instance().getContainerSizes()

      expect(sizes.containerSize).toBe(580)
    })

    it("#getContainerSizes returns correct sizes for large image_sets in standard/feature articles", () => {
      props.section = largeImageSetSection
      const component = getShallowWrapper(props)
      const sizes = component.instance().getContainerSizes()

      expect(sizes.containerSize).toBe(680)
      expect(sizes.targetHeight).toBe(400)
    })

    it("#getContainerSizes returns correct sizes for large image_sets in classic articles", () => {
      props.article.layout = "classic"
      props.section = largeImageSetSection
      const component = getShallowWrapper(props)
      const sizes = component.instance().getContainerSizes()

      expect(sizes.containerSize).toBe(580)
      expect(sizes.targetHeight).toBe(400)
    })
  })

  describe("Fillwidth", () => {
    it("#setFillWidthDimensions returns an array of image sizes", () => {
      const component = getShallowWrapper(props)
      const sizes = component.instance().setFillWidthDimensions()

      expect(sizes.length).toBe(props.section.images.length)
      expect(sizes[0].width).toBe(287)
      expect(sizes[0].height).toBe(383)
    })

    it("#getFillWidthDimensions returns state.dimensions", () => {
      const component = getShallowWrapper(props)
      const sizes = component.instance().getFillWidthDimensions()

      expect(sizes.length).toBe(props.section.images.length)
      expect(sizes[0].width).toBe(287)
      expect(sizes[0].height).toBe(383)
    })

    it("#getFillWidthDimensions returns false if section layout is column", () => {
      props.section.layout = "column_width"
      const component = getShallowWrapper(props)
      const sizes = component.instance().getFillWidthDimensions()

      expect(sizes).toBe(false)
    })
  })
})
