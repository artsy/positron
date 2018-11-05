import { clone, extend } from "lodash"
import { mount } from "enzyme"
import React from "react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import Backbone from "backbone"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import Artwork from "../../../../../../../models/artwork.coffee"
import { SectionControls } from "../../../section_controls"
import { Autocomplete } from "/client/components/autocomplete2"
import { ImagesControls } from "../components/controls"
require("typeahead.js")

describe("ImagesControls", () => {
  let props
  const artwork = clone(StandardArticle.sections[4].images[2])

  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: props.article,
        section: props.editSection,
      },
    })
    return mount(
      <Provider store={store}>
        <section>
          <ImagesControls {...props} />
        </section>
      </Provider>
    )
  }

  const rawArtwork = {
    description: "Acrylic on glass, 66.3 × 40 × 2.5 cm",
    title: "Ryan Gander, Please be patient you two",
    type: "artwork",
    _id: "5698bc71275b2479120000a9",
    _links: {
      self: {
        href:
          "https://stagingapi.artsy.net/api/artworks/5698bc71275b2479120000a9",
      },
      thumbnail: {
        href:
          "https://d32dm0rphc51dk.cloudfront.net/S8Jb9AX0ickx4qyXjxWPkg/square.jpg",
      },
    },
  }

  beforeEach(() => {
    props = {
      article: clone(StandardArticle),
      logErrorAction: jest.fn(),
      editSection: clone(StandardArticle.sections[4]),
      sectionIndex: 2,
      setProgress: jest.fn(),
      onChangeHeroAction: jest.fn(),
      onChangeSectionAction: jest.fn(),
      removeSectionAction: jest.fn(),
    }

    SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
    SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
  })

  it("renders all fields", () => {
    const component = getWrapper(props)

    expect(component.find(SectionControls).length).toBe(1)
    expect(component.html()).toMatch("overflow_fillwidth")
    expect(component.html()).toMatch(
      '<a name="overflow_fillwidth" class="layout" data-active="true">'
    )
    expect(component.html()).toMatch("column_width")
    expect(component.html()).toMatch("fillwidth")
    expect(component.html()).toMatch("image_set")
    expect(component.html()).toMatch('<input type="file"')
    expect(component.html()).toMatch(
      'placeholder="Search artworks by title..."'
    )
    expect(component.html()).toMatch('placeholder="Add artwork url"')
  })

  it("does not display artwork inputs or layouts if heroSection", () => {
    props.isHero = true
    const component = getWrapper(props)

    expect(component.html()).not.toMatch('class="layout"')
    expect(component.html()).not.toMatch(
      'placeholder="Search for artwork by title"'
    )
    expect(component.html()).not.toMatch('placeholder="Add artwork url"')
  })

  it("does not display layouts if article layout is news", () => {
    props.article.layout = "news"
    const component = getWrapper(props)

    expect(component.html()).not.toMatch('class="layout"')
  })

  it("#componentWillUnmount removes the section on unmount if no images", () => {
    props.editSection.images = []
    const component = getWrapper(props).find(ImagesControls)

    component.instance().componentWillUnmount()
    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.sectionIndex)
  })

  describe("Artwork inputs", () => {
    it("#onUpload saves an image info after upload", () => {
      props.isHero = false
      const component = getWrapper(props).find(ImagesControls)

      component.instance().onUpload("http://image.jpg", 400, 800)
      const newImages = props.onChangeSectionAction.mock.calls[0][1]
      const newImage = props.onChangeSectionAction.mock.calls[0][1][3]

      expect(newImages.length).toBe(props.editSection.images.length + 1)
      expect(newImage.type).toMatch("image")
      expect(newImage.url).toMatch("http://image.jpg")
      expect(newImage.width).toBe(400)
      expect(newImage.height).toBe(800)
    })

    it("Autocomplete onSelect resets the section images", () => {
      props.editSection.images = []
      const component = getWrapper(props)
      const images = StandardArticle.sections[4].images

      component
        .find(Autocomplete)
        .first()
        .props()
        .onSelect(images)
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("images")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(images)
    })

    it("Autocomplete onSelect limits images to 1 if layout is news", () => {
      props.article.layout = "news"
      props.editSection.images = clone(StandardArticle.sections[4].images)
      const component = getWrapper(props)
      const images = clone(props.editSection.images)
      const newImage = { type: "image", url: "http://image.jpg" }
      images.push(newImage)

      component
        .find(Autocomplete)
        .first()
        .props()
        .onSelect(images)
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("images")
      expect(props.onChangeSectionAction.mock.calls[0][1].length).toBe(1)
      expect(props.onChangeSectionAction.mock.calls[0][1][0]).toBe(newImage)
    })

    it("#filterAutocomplete returns formatted artworks", () => {
      const component = getWrapper(props).find(ImagesControls)
      const items = { _embedded: { results: [rawArtwork] } }
      const filtered = component.instance().filterAutocomplete(items)[0]

      expect(filtered._id).toBe(rawArtwork._id)
      expect(filtered.title).toBe(rawArtwork.title)
      expect(filtered.thumbnail_image).toBe(rawArtwork._links.thumbnail.href)
      expect(filtered.type).toBe(rawArtwork.type)
      expect(filtered.description).toBe(undefined)
    })

    it("#filterAutocomplete returns false for non-artwork items", () => {
      const component = getWrapper(props).find(ImagesControls)
      const items = { _embedded: { results: [rawArtwork, { type: "artist" }] } }
      const filtered = component.instance().filterAutocomplete(items)

      expect(filtered[0].type).toBe("artwork")
      expect(filtered[1]).toBe(false)
    })

    it("#fetchDenormalizedArtwork returns a denormalized artwork", async () => {
      Artwork.prototype.denormalized = jest.fn().mockReturnValueOnce(artwork)
      Backbone.Model.prototype.fetch = jest.fn().mockReturnValueOnce(artwork)
      const component = getWrapper(props).find(ImagesControls)

      const fetchedArtwork = await component
        .instance()
        .fetchDenormalizedArtwork("1234")
      expect(fetchedArtwork).toBe(artwork)
    })

    it("#fetchDenormalizedArtwork calls #logErrorAction on error", async () => {
      Backbone.Model.prototype.fetch = jest.fn(() => {
        const err = { message: "an error" }
        throw err
      })
      const component = getWrapper(props).find(ImagesControls)

      await component.instance().fetchDenormalizedArtwork("1234")
      expect(props.logErrorAction.mock.calls.length).toBe(1)
    })

    it("#onNewImage updates the section images", () => {
      const component = getWrapper(props).find(ImagesControls)
      component.instance().onNewImage({ type: "artwork", image: "artwork.jpg" })
      const newImages = props.onChangeSectionAction.mock.calls[0][1]
      const newImage = props.onChangeSectionAction.mock.calls[0][1][3]

      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("images")
      expect(newImages.length).toBe(props.editSection.images.length + 1)
      expect(newImage.type).toMatch("artwork")
      expect(newImage.image).toMatch("artwork.jpg")
    })

    it("#onNewImage can update hero section images", () => {
      props.isHero = true
      props.section = {
        type: "image",
        images: clone(StandardArticle.sections[4].images),
      }
      const component = getWrapper(props).find(ImagesControls)
      component.instance().onNewImage({ type: "artwork", image: "artwork.jpg" })
      const newImages = props.onChangeHeroAction.mock.calls[0][1]
      const newImage = props.onChangeHeroAction.mock.calls[0][1][3]

      expect(props.onChangeHeroAction.mock.calls[0][0]).toBe("images")
      expect(newImages.length).toBe(props.section.images.length + 1)
      expect(newImage.type).toMatch("artwork")
      expect(newImage.image).toMatch("artwork.jpg")
    })

    it("#onNewImage limits images to 1 if layout is news", () => {
      props.article.layout = "news"
      props.editSection = {
        type: "image",
        images: clone(StandardArticle.sections[4].images),
      }
      const component = getWrapper(props).find(ImagesControls)
      component.instance().onNewImage({ type: "artwork", image: "artwork.jpg" })
      const newImages = props.onChangeSectionAction.mock.calls[0][1]
      const newImage = props.onChangeSectionAction.mock.calls[0][1][0]
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("images")
      expect(newImages.length).toBe(1)
      expect(newImage.type).toMatch("artwork")
      expect(newImage.image).toMatch("artwork.jpg")
    })

    it("#inputsAreDisabled returns false if layout is not fillwidth", () => {
      const component = getWrapper(props).find(ImagesControls)

      const inputsAreDisabled = component
        .instance()
        .inputsAreDisabled(props.section)
      expect(inputsAreDisabled).toBe(false)
    })

    it("#inputsAreDisabled returns true if fillwidth section has images", () => {
      props.editSection.layout = "fillwidth"
      const component = getWrapper(props).find(ImagesControls)

      const inputsAreDisabled = component
        .instance()
        .inputsAreDisabled(props.section)
      expect(inputsAreDisabled).toBe(true)
    })

    it("#fillWidthAlert calls #logErrorAction", () => {
      const component = getWrapper(props).find(ImagesControls)

      component.instance().fillWidthAlert()
      expect(component.props().logErrorAction.mock.calls.length).toBe(1)
    })

    it("Calls #logErrorAction via #fillWidthAlert if inputsAreDisabled and trying to add an image", () => {
      props.editSection.layout = "fillwidth"
      const component = getWrapper(props)

      component
        .find(".edit-controls__artwork-inputs")
        .at(0)
        .simulate("click")
      expect(props.logErrorAction.mock.calls.length).toBe(1)
    })
  })

  describe("Image Set inputs", () => {
    beforeEach(() => {
      extend(props.editSection, { type: "image_set", layout: "mini" })
    })

    it("Renders the active image_set layout", () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch(
        '<div class="input-group"><div class="radio-input" data-active="true"></div>Mini</div>'
      )
    })

    it("changes image_set layout on button click", () => {
      const component = getWrapper(props)

      component
        .find(".radio-input")
        .at(1)
        .simulate("click")
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("layout")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe("full")
    })

    it("changes image_set title on input", () => {
      const component = getWrapper(props)
      const input = component
        .find(".edit-controls__image-set-inputs")
        .find("input")
      const newTitle = "A title for the Image Set"
      input.simulate("change", { target: { value: newTitle } })

      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("title")
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(newTitle)
    })
  })
})
