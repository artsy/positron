import {
  newSection,
  newHeroSection,
  onChangeSection,
  onChangeHero,
  removeSection,
  setSection,
} from "client/actions/edit/sectionActions"
import { cloneDeep } from "lodash"
import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"

describe("sectionActions", () => {
  let article

  beforeEach(() => {
    article = cloneDeep(FeatureArticle)
  })

  describe("#newSection", () => {
    it("Can create an embed section", () => {
      const action = newSection("embed", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("embed")
      expect(section.url).toBe("")
      expect(section.layout).toBe("column_width")
      expect(section.height).toBe("")
      expect(sectionIndex).toBe(3)
    })

    it("Can create an image_collection section", () => {
      const action = newSection("image_collection", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("image_collection")
      expect(section.images.length).toBe(0)
      expect(section.layout).toBe("overflow_fillwidth")
      expect(sectionIndex).toBe(3)
    })

    it("Can create a text section", () => {
      const action = newSection("text", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("text")
      expect(section.body).toBe("")
      expect(sectionIndex).toBe(3)
    })

    it("Can create a blockquote section", () => {
      const action = newSection("blockquote", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("text")
      expect(section.body).toBe("")
      expect(section.layout).toBe("blockquote")
      expect(sectionIndex).toBe(3)
    })

    it("Can create a video section", () => {
      const action = newSection("video", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("video")
      expect(section.url).toBe("")
      expect(section.layout).toBe("column_width")
      expect(sectionIndex).toBe(3)
    })

    it("Can add attributes to a new section", () => {
      const body =
        "<p>The Precarious, Glamorous Lives of Independent Curators</p>"
      const action = newSection("blockquote", 3, { body })
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("text")
      expect(section.body).toBe(body)
      expect(section.layout).toBe("blockquote")
      expect(sectionIndex).toBe(3)
    })
  })

  describe("#newHeroSection", () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({ edit: { article } }))
      dispatch = jest.fn()
    })

    it("Can create an image_collection section", () => {
      newHeroSection("image_collection")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("CHANGE_ARTICLE")
      expect(dispatch.mock.calls[1][0].payload.data.hero_section.type).toBe(
        "image_collection"
      )
    })

    it("Can create a video section", () => {
      newHeroSection("video")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("CHANGE_ARTICLE")
      expect(dispatch.mock.calls[1][0].payload.data.hero_section.type).toBe(
        "video"
      )
    })
  })

  describe("#onChangeSection", () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({
        edit: { article },
      }))
      dispatch = jest.fn()
    })

    it("calls #changeArticle with new attrs", () => {
      onChangeSection("body", "New Text")(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe("CHANGE_SECTION")
      expect(dispatch.mock.calls[0][0].payload.key).toBe("body")
      expect(dispatch.mock.calls[0][0].payload.value).toBe("New Text")
    })

    it("does not call #saveArticle if published", () => {
      onChangeSection("body", "New Text")(dispatch, getState)
      expect(dispatch.mock.calls.length).toBe(1)
    })

    it("calls debounced #saveArticle if draft", done => {
      article.published = false
      onChangeSection("body", "New")(dispatch, getState)
      onChangeSection("body", "New Te")(dispatch, getState)
      onChangeSection("body", "New Text")(dispatch, getState)

      setTimeout(() => {
        expect(dispatch.mock.calls.length).toBe(4)
        done()
      }, 550)
    })
  })

  describe("#onChangeHero", () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({
        edit: { article },
      }))
      dispatch = jest.fn()
    })

    it("calls #changeArticle with new attrs", () => {
      onChangeHero("type", "basic")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("CHANGE_ARTICLE")
      expect(dispatch.mock.calls[1][0].payload.data.hero_section.type).toBe(
        "basic"
      )
    })

    it("does not call #saveArticle if published", () => {
      onChangeHero("type", "basic")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls.length).toBe(2)
    })

    it("calls debounced #saveArticle if draft", done => {
      article.published = false
      onChangeHero("deck", "De")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      onChangeHero("deck", "Dec")(dispatch, getState)
      dispatch.mock.calls[2][0](dispatch, getState)
      onChangeHero("deck", "Deck")(dispatch, getState)
      dispatch.mock.calls[4][0](dispatch, getState)

      setTimeout(() => {
        expect(dispatch.mock.calls.length).toBe(7)
        done()
      }, 550)
    })
  })

  it("#removeSection calls #onChangeArticle with new sections", () => {
    let dispatch = jest.fn()
    let getState = jest.fn(() => ({
      edit: { article },
      app: { channel: { type: "editorial" } },
    }))
    removeSection(6)(dispatch, getState)
    dispatch.mock.calls[0][0](dispatch, getState)
    dispatch.mock.calls[1][0](dispatch, getState)

    expect(dispatch.mock.calls[2][0].type).toBe("CHANGE_ARTICLE")
    expect(dispatch.mock.calls[2][0].payload.data.sections[6].body).toBe(
      article.sections[7].body
    )
    expect(dispatch.mock.calls[2][0].payload.data.sections[5].body).toBe(
      article.sections[5].body
    )
    expect(dispatch.mock.calls[2][0].payload.data.sections.length).toBe(
      article.sections.length - 1
    )
  })

  it("#setSection sets sectionIndex to arg", () => {
    const action = setSection(6)

    expect(action.type).toBe("SET_SECTION")
    expect(action.payload.sectionIndex).toBe(6)
  })
})
