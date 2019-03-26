import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import {
  newHeroSection,
  newSection,
  onChangeHero,
  onChangeSection,
  removeSection,
  setSection,
  setupSection,
} from "client/actions/edit/sectionActions"
const Article = require("client/models/article.coffee")
import { cloneDeep } from "lodash"

jest.mock("client/models/article.coffee", () => jest.fn())
jest.mock("lodash/debounce", () => jest.fn(e => e))

Article.mockImplementation(() => ({
  on: jest.fn(),
  isNew: jest.fn(),
  save: jest.fn(),
}))

describe("sectionActions", () => {
  let article

  beforeEach(() => {
    article = cloneDeep(FeatureArticle)
  })

  it("#setSection sets sectionIndex to arg", () => {
    const action = setSection(6)

    expect(action.type).toBe("SET_SECTION")
    expect(action.payload.sectionIndex).toBe(6)
  })

  describe("#setupSection", () => {
    it("Creates a text section by default", () => {
      expect(setupSection()).toEqual({ type: "text", body: "" })
    })

    it("Can create a text section with arg", () => {
      expect(setupSection("text")).toEqual({ type: "text", body: "" })
    })

    it("Can create an embed section", () => {
      expect(setupSection("embed")).toEqual({
        type: "embed",
        url: "",
        layout: "column_width",
        height: 0,
      })
    })

    it("Can create a social_embed section", () => {
      expect(setupSection("social_embed")).toEqual({
        type: "social_embed",
        url: "",
        layout: "column_width",
      })
    })

    it("Can create an image_collection section", () => {
      expect(setupSection("image_collection")).toEqual({
        type: "image_collection",
        layout: "overflow_fillwidth",
        images: [],
      })
    })

    it("Can create a video section", () => {
      expect(setupSection("video")).toEqual({
        type: "video",
        url: "",
        layout: "column_width",
      })
    })
  })

  describe("#newSection", () => {
    it("Can create an embed section", () => {
      const action = newSection("embed", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(3)
      expect(section).toEqual({
        type: "embed",
        url: "",
        layout: "column_width",
        height: 0,
      })
    })

    it("Can create a social_embed section", () => {
      const action = newSection("social_embed", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(3)
      expect(section).toEqual({
        type: "social_embed",
        url: "",
        layout: "column_width",
      })
    })

    it("Can create an image_collection section", () => {
      const action = newSection("image_collection", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(3)
      expect(section).toEqual({
        type: "image_collection",
        layout: "overflow_fillwidth",
        images: [],
      })
    })

    it("Can create a text section", () => {
      const action = newSection("text", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(3)
      expect(section).toEqual({ type: "text", body: "" })
    })

    it("Can create a video section", () => {
      const action = newSection("video", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(3)
      expect(section).toEqual({
        type: "video",
        url: "",
        layout: "column_width",
      })
    })

    it("Can add attributes to a new section", () => {
      const body =
        "<p>The Precarious, Glamorous Lives of Independent Curators</p>"
      const action = newSection("text", 3, { body })
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(3)
      expect(section).toEqual({ type: "text", body })
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

      expect(dispatch).toHaveBeenLastCalledWith({
        type: "CHANGE_ARTICLE",
        payload: {
          data: {
            hero_section: {
              type: "image_collection",
              layout: "overflow_fillwidth",
              images: [],
            },
          },
        },
      })
    })

    it("Can create a video section", () => {
      newHeroSection("video")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch).toHaveBeenLastCalledWith({
        type: "CHANGE_ARTICLE",
        payload: {
          data: {
            hero_section: { type: "video", url: "", layout: "column_width" },
          },
        },
      })
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

    it("calls #changeSection with new attrs", () => {
      onChangeSection("body", "New Text")(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        type: "CHANGE_SECTION",
        payload: { key: "body", value: "New Text" },
      })
    })

    it("does not call #saveArticle if published", () => {
      onChangeSection("body", "New Text")(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        type: "CHANGE_SECTION",
        payload: { key: "body", value: "New Text" },
      })
      expect(dispatch).toHaveBeenCalledTimes(1)
    })

    it("calls debounced #saveArticle if draft", () => {
      article.published = false
      onChangeSection("body", "New")(dispatch, getState)
      const onSaveArticle = dispatch.mock.calls[1][0]
      onSaveArticle(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "SAVE_ARTICLE",
        payload: { isSaving: true },
      })
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

    it("calls debounced #saveArticle if draft", () => {
      article.published = false
      onChangeHero("deck", "Deck")(dispatch, getState)
      const onChangeArticle = dispatch.mock.calls[0][0]
      onChangeArticle(dispatch, getState)
      const onSaveArticle = dispatch.mock.calls[1][0]
      onSaveArticle(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "SAVE_ARTICLE",
        payload: { isSaving: true },
      })
    })
  })

  it("#removeSection calls #changeArticle with new sections", () => {
    const dispatch = jest.fn()
    const getState = jest.fn(() => ({
      edit: { article },
      app: { channel: { type: "editorial" } },
    }))
    removeSection(6)(dispatch, getState)

    const onChangeArticle = dispatch.mock.calls[0][0]
    dispatch.mockClear()
    onChangeArticle(dispatch, getState)

    const changeArticleData = dispatch.mock.calls[0][0]
    dispatch.mockClear()
    changeArticleData(dispatch, getState)
    const changeArticleArgs = dispatch.mock.calls[0][0]
    const { sections } = changeArticleArgs.payload.data

    expect(changeArticleArgs.type).toBe("CHANGE_ARTICLE")
    expect(sections[6].body).toBe(article.sections[7].body)
    expect(sections[5].body).toBe(article.sections[5].body)
    expect(sections.length).toBe(article.sections.length - 1)
  })
})
