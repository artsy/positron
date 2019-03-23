import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import {
  maybeMergeTextSections,
  maybeRemoveEmptyText,
  newHeroSection,
  newSection,
  onChangeHero,
  onChangeSection,
  onInsertBlockquote,
  onMergeTextSections,
  onSplitTextSection,
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

  describe("#onSplitTextSection", () => {
    let dispatch
    let getState
    const sectionIndex = 0
    beforeEach(() => {
      dispatch = jest.fn()
    })
    const sectionOne = "<p>First section</p>"
    const sectionTwo = "<p>Second section</p>"

    it("Updates current section with updated html", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex },
      }))
      onSplitTextSection(sectionOne, sectionTwo)(dispatch, getState)
      const changeSection = dispatch.mock.calls[0][0]
      changeSection(dispatch, getState)

      const { type, payload } = dispatch.mock.calls[2][0]
      expect(type).toBe("CHANGE_SECTION")
      expect(payload.value).toBe(sectionOne)
    })

    it("Adds a new section with new html", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex },
      }))
      onSplitTextSection(sectionOne, sectionTwo)(dispatch, getState)
      const changeSection = dispatch.mock.calls[0][0]
      changeSection(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "NEW_SECTION",
        payload: {
          section: { type: "text", body: "<p>Second section</p>" },
          sectionIndex: 1,
        },
      })
    })

    it("Saves article if unpublished", () => {
      article.published = false
      getState = jest.fn(() => ({
        edit: { article, sectionIndex },
      }))
      onSplitTextSection(sectionOne, sectionTwo)(dispatch, getState)
      const changeSection = dispatch.mock.calls[0][0]
      dispatch.mockClear()
      changeSection(dispatch, getState)

      const onSaveArticle = dispatch.mock.calls[1][0]
      onSaveArticle(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "SAVE_ARTICLE",
        payload: { isSaving: true },
      })
    })
  })

  describe("#onInsertBlockquote", () => {
    let dispatch
    let getState

    beforeEach(() => {
      dispatch = jest.fn()
    })

    const blockquoteHtml = "<blockquote>a blockquote</blockquote>"
    const beforeHtml = "<p>a text before</p>"
    const afterHtml = "<p>a text after</p>"

    it("Changes existing section with blockquote text and sets section to null", () => {
      getState = jest.fn(() => ({
        edit: { article },
      }))
      onInsertBlockquote(blockquoteHtml, "", "")(dispatch, getState)
      const changeSection = dispatch.mock.calls[0][0]
      changeSection(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_SECTION",
        payload: { sectionIndex: null },
      })
      expect(dispatch).toHaveBeenCalledWith({
        type: "CHANGE_SECTION",
        payload: {
          key: "body",
          value: "<blockquote>a blockquote</blockquote>",
        },
      })
    })

    it("Moves text before blockquote to new section", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex: 0 },
      }))
      onInsertBlockquote(blockquoteHtml, beforeHtml, "")(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_SECTION",
        payload: { sectionIndex: null },
      })
      expect(dispatch).toHaveBeenCalledWith({
        payload: {
          section: { body: "<p>a text before</p>", type: "text" },
          sectionIndex: 0,
        },
        type: "NEW_SECTION",
      })
    })

    it("Moves text after blockquote to new section", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex: 0 },
      }))
      onInsertBlockquote(blockquoteHtml, "", afterHtml)(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_SECTION",
        payload: { sectionIndex: null },
      })
      expect(dispatch).toHaveBeenCalledWith({
        payload: {
          section: { body: "<p>a text after</p>", type: "text" },
          sectionIndex: 1,
        },
        type: "NEW_SECTION",
      })
    })

    it("Can handle blockquotes with before and after sections", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex: 0 },
      }))

      onInsertBlockquote(blockquoteHtml, beforeHtml, afterHtml)(
        dispatch,
        getState
      )
      const changeSection = dispatch.mock.calls[0][0]
      changeSection(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_SECTION",
        payload: { sectionIndex: null },
      })
      expect(dispatch).toHaveBeenCalledWith({
        payload: {
          section: { body: "<p>a text before</p>", type: "text" },
          sectionIndex: 0,
        },
        type: "NEW_SECTION",
      })
      expect(dispatch).toHaveBeenCalledWith({
        payload: {
          section: { body: "<p>a text after</p>", type: "text" },
          sectionIndex: 1,
        },
        type: "NEW_SECTION",
      })
      expect(dispatch).toHaveBeenCalledWith({
        payload: {
          key: "body",
          value: "<blockquote>a blockquote</blockquote>",
        },
        type: "CHANGE_SECTION",
      })
    })

    it("Calls save if a new section is added and unpublished", () => {
      article.published = false
      getState = jest.fn(() => ({
        edit: { article, sectionIndex: 0 },
        app: { channel: { type: "editorial" } },
      }))
      onInsertBlockquote(blockquoteHtml, beforeHtml, "")(dispatch, getState)
      const changeSection = dispatch.mock.calls[0][0]
      changeSection(dispatch, getState)
      const onSaveArticle = dispatch.mock.calls[2][0]
      onSaveArticle(dispatch, getState)

      expect(dispatch).toHaveBeenCalledWith({
        payload: {
          section: { body: "<p>a text before</p>", type: "text" },
          sectionIndex: 0,
        },
        type: "NEW_SECTION",
      })
      expect(dispatch).toHaveBeenCalledWith({
        type: "SET_SECTION",
        payload: { sectionIndex: null },
      })
      expect(dispatch).toHaveBeenCalledWith({
        payload: {
          key: "body",
          value: "<blockquote>a blockquote</blockquote>",
        },
        type: "CHANGE_SECTION",
      })
      expect(dispatch).toHaveBeenCalledWith({
        type: "SAVE_ARTICLE",
        payload: {
          isSaving: true,
        },
      })
    })
  })

  describe("#maybeMergeTextSections", () => {
    let dispatch
    let getState
    let section
    let sectionIndex

    beforeEach(() => {
      sectionIndex = 1
      section = cloneDeep(article.sections[sectionIndex])
      dispatch = jest.fn()
      getState = jest.fn(() => ({
        edit: {
          article,
          section,
          sectionIndex,
        },
      }))
    })

    it("Calls #onMergeTextSections with new html if section before is text", () => {
      maybeMergeTextSections()(dispatch, getState)
      const OnMergeTextSections = dispatch.mock.calls[0][0]
      OnMergeTextSections(dispatch, getState)
      const OnChangeSection = dispatch.mock.calls[1][0]
      OnChangeSection(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        type: "CHANGE_SECTION",
        payload: {
          key: "body",
          value:
            "<p>Around two years ago, a collector encouraged New York-based ceramic artist <a href='https://www.artsy.net/artist/jennie-jieun-lee'>Jennie Jieun Lee</a> to apply for an art prize. “I was a little bit scared. I’d applied to a few things in the past and been rejected, so I was bummed by that,” she admits. “I entered not thinking that I was going to win, but that it would be a good exercise to go through the process.” &nbsp;</p><p>It paid off. She was among several artists in 2015 who won an Artadia Award—an unrestricted, merit-based prize of up to $10,000, which is given to visual artists working in certain U.S. cities. The winnings, as well as the experience, helped Lee push her career forward. </p><p>“That money enabled me to move into a bigger studio and buy a larger kiln,” she explains. “With that movement, I was able to make my career.” And the momentum continued: More recently, she won a Pollock-Krasner grant that she used to move cross-country and fund a residency in the ceramic department at California State University, Long Beach. </p><p>Lee is by no means alone. While we’ve all heard of the boldfaced awards, like the Turner Prize or the Hugo Boss Prize, which tend to anoint artists when they’re already well known to the art world, a wealth of awards are available for lesser-known and emerging artists. </p><p>Land exhibitions, make influential contacts, and gain valuable feedback about your work.</p>",
        },
      })
    })

    it("Does nothing if sectionIndex is 0", () => {
      sectionIndex = 0
      getState.mockImplementation(() => ({
        edit: {
          article,
          section,
          sectionIndex,
        },
      }))
      maybeMergeTextSections()(dispatch, getState)
      expect(dispatch).not.toBeCalled()
    })

    it("Does nothing if section before is not text", () => {
      sectionIndex = 3
      getState.mockImplementation(() => ({
        edit: {
          article,
          section,
          sectionIndex,
        },
      }))
      maybeMergeTextSections()(dispatch, getState)
      expect(dispatch).not.toBeCalled()
    })

    it("Strips blockquotes from html", () => {
      expect(section.body).toMatch("<blockquote>")

      maybeMergeTextSections()(dispatch, getState)
      const OnMergeTextSections = dispatch.mock.calls[0][0]
      OnMergeTextSections(dispatch, getState)
      const OnChangeSection = dispatch.mock.calls[1][0]
      OnChangeSection(dispatch, getState)
      const { type, payload } = dispatch.mock.calls[3][0]

      expect(type).toBe("CHANGE_SECTION")
      expect(payload.value).not.toMatch("<blockquote>")
    })
  })

  describe("#onMergeTextSections", () => {
    let dispatch
    let getState
    let section
    let sectionIndex

    beforeEach(() => {
      sectionIndex = 1
      section = cloneDeep(article.sections[sectionIndex])
      dispatch = jest.fn()
    })

    it("Calls #onChangeSection with new html", () => {
      getState = jest.fn(() => ({
        edit: {
          article,
          section,
          sectionIndex,
        },
      }))
      onMergeTextSections("<p>New html</p>")(dispatch, getState)
      const OnChangeSection = dispatch.mock.calls[0][0]
      OnChangeSection(dispatch, getState)
      const RemoveSection = dispatch.mock.calls[1][0]
      RemoveSection(dispatch, getState)
      const { type, payload } = dispatch.mock.calls[2][0]

      expect(type).toBe("CHANGE_SECTION")
      expect(payload.value).toMatch("<p>New html</p>")
    })

    it("Calls #removeSection", () => {
      getState = jest.fn(() => ({
        edit: {
          article,
          section,
          sectionIndex,
        },
        app: { channel: { type: "editorial" } },
      }))
      onMergeTextSections("<p>New html</p>")(dispatch, getState)
      const OnChangeSection = dispatch.mock.calls[0][0]
      OnChangeSection(dispatch, getState)
      const OnRemoveSection = dispatch.mock.calls[1][0]
      dispatch.mockClear()
      OnRemoveSection(dispatch, getState)
      const RemoveSection = dispatch.mock.calls[0][0]
      dispatch.mockClear()
      RemoveSection(dispatch, getState)
      const onChangeArticle = dispatch.mock.calls[0][0]
      dispatch.mockClear()
      onChangeArticle(dispatch, getState)

      const {
        type,
        payload: { data },
      } = dispatch.mock.calls[0][0]

      expect(type).toBe("CHANGE_ARTICLE")
      expect(data.sections.length).toBe(article.sections.length - 1)
    })
  })

  describe("#maybeRemoveEmptyText", () => {
    let dispatch
    let getState

    beforeEach(() => {
      global.Date = jest.fn(() => ({
        toISOString: () => "2019-03-19T20:33:06.821Z",
      })) as any
      dispatch = jest.fn()
      getState = jest.fn(() => ({
        edit: {
          article,
        },
        app: { channel: { type: "editorial" } },
      }))
    })

    it("Deletes text sections with empty body", () => {
      article = { sections: [{ type: "text", body: "" }] }
      getState = jest.fn(() => ({
        edit: {
          article,
        },
        app: { channel: { type: "editorial" } },
      }))

      maybeRemoveEmptyText(0)(dispatch, getState)
      const onRemoveSection = dispatch.mock.calls[0][0]
      onRemoveSection(dispatch, getState)
      const changeSection = dispatch.mock.calls[1][0]
      changeSection(dispatch, getState)
      const changeArticle = dispatch.mock.calls[2][0]
      changeArticle(dispatch, getState)
      const onSaveArticle = dispatch.mock.calls[4][0]
      onSaveArticle(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        payload: { data: { sections: [] } },
        type: "CHANGE_ARTICLE",
      })
      expect(dispatch).toBeCalledWith({
        type: "SAVE_ARTICLE",
        payload: { isSaving: true },
      })
      expect(dispatch).toBeCalledWith({
        key: "userCurrentlyEditing",
        type: "UPDATE_ARTICLE",
        payload: {
          timestamp: "2019-03-19T20:33:06.821Z",
          channel: { type: "editorial" },
          article: undefined,
        },
      })
    })

    it("Deletes text sections with empty html for body", () => {
      article = {
        sections: [{ type: "text", body: "<p>  </p><h2></h2><h3></h3>" }],
      }
      getState = jest.fn(() => ({
        edit: {
          article,
        },
        app: { channel: { type: "editorial" } },
      }))

      maybeRemoveEmptyText(0)(dispatch, getState)
      const onRemoveSection = dispatch.mock.calls[0][0]
      onRemoveSection(dispatch, getState)
      const changeSection = dispatch.mock.calls[1][0]
      changeSection(dispatch, getState)
      const changeArticle = dispatch.mock.calls[2][0]
      changeArticle(dispatch, getState)
      const onSaveArticle = dispatch.mock.calls[4][0]
      onSaveArticle(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        payload: { data: { sections: [] } },
        type: "CHANGE_ARTICLE",
      })
      expect(dispatch).toBeCalledWith({
        type: "SAVE_ARTICLE",
        payload: { isSaving: true },
      })
      expect(dispatch).toBeCalledWith({
        key: "userCurrentlyEditing",
        type: "UPDATE_ARTICLE",
        payload: {
          timestamp: "2019-03-19T20:33:06.821Z",
          channel: { type: "editorial" },
          article: undefined,
        },
      })
    })

    it("Sanitizes text sections that are empty and include h1", () => {
      article = {
        sections: [{ type: "text", body: "<h1>  </h1><p></p>" }],
      }
      getState = jest.fn(() => ({
        edit: {
          article,
        },
        app: { channel: { type: "editorial" } },
      }))

      maybeRemoveEmptyText(0)(dispatch, getState)
      const onRemoveSection = dispatch.mock.calls[0][0]
      onRemoveSection(dispatch, getState)
      const changeSection = dispatch.mock.calls[1][0]
      dispatch.mockClear()
      changeSection(dispatch, getState)

      const {
        type,
        payload: { data },
      } = dispatch.mock.calls[0][0]

      expect(type).toBe("CHANGE_ARTICLE")
      expect(data.sections[0].body).toBe("<h1></h1>")
    })

    it("Does nothing for text sections with body", () => {
      maybeRemoveEmptyText(1)(dispatch, getState)
      expect(dispatch).not.toBeCalled()
    })

    it("Does nothing for non-text sections", () => {
      maybeRemoveEmptyText(2)(dispatch, getState)
      expect(dispatch).not.toBeCalled()
    })
  })
})
