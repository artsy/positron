import {
  maybeMergeTextSections,
  newSection,
  newHeroSection,
  onChangeSection,
  onChangeHero,
  onInsertBlockquote,
  onMergeTextSections,
  onSplitTextSection,
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

  it("#setSection sets sectionIndex to arg", () => {
    const action = setSection(6)

    expect(action.type).toBe("SET_SECTION")
    expect(action.payload.sectionIndex).toBe(6)
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

    it("Can create a social_embed section", () => {
      const action = newSection("social_embed", 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("social_embed")
      expect(section.url).toBe("")
      expect(section.layout).toBe("column_width")
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
      const action = newSection("text", 3, { body })
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe("NEW_SECTION")
      expect(section.type).toBe("text")
      expect(section.body).toBe(body)
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
      dispatch.mock.calls[0][0](dispatch, getState)

      const { type, payload } = dispatch.mock.calls[2][0]
      expect(type).toBe("CHANGE_SECTION")
      expect(payload.value).toBe(sectionOne)
    })

    it("Adds a new section with new html", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex },
      }))
      onSplitTextSection(sectionOne, sectionTwo)(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      const { type, payload } = dispatch.mock.calls[1][0]
      expect(type).toBe("NEW_SECTION")
      expect(payload.section.type).toBe("text")
      expect(payload.section.body).toBe(sectionTwo)
    })

    it("Saves article if unpublished", done => {
      article.published = false
      getState = jest.fn(() => ({
        edit: { article, sectionIndex },
      }))
      onSplitTextSection(sectionOne, sectionTwo)(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      setTimeout(() => {
        dispatch.mock.calls[3][0](dispatch, getState)
        expect(dispatch.mock.calls[4][0].type).toBe("SAVE_ARTICLE")
        done()
      }, 500)
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
      dispatch.mock.calls[0][0](dispatch, getState)

      const setSection = dispatch.mock.calls[1][0]
      expect(setSection.type).toBe("SET_SECTION")
      expect(setSection.payload.sectionIndex).toBe(null)

      const changeSection = dispatch.mock.calls[2][0]
      expect(changeSection.type).toBe("CHANGE_SECTION")
      expect(changeSection.payload.key).toBe("body")
      expect(changeSection.payload.value).toBe(blockquoteHtml)
    })

    it("Moves text before blockquote to new section", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex: 0 }
      }))
      onInsertBlockquote(blockquoteHtml, beforeHtml, "")(dispatch, getState)
      const { type, payload: { section, sectionIndex } } = dispatch.mock.calls[1][0]

      expect(type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(0)
      expect(section.type).toBe("text")
      expect(section.body).toBe(beforeHtml)
    })

    it("Moves text after blockquote to new section", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex: 0 }
      }))
      onInsertBlockquote(blockquoteHtml, "", afterHtml)(dispatch, getState)
      const { type, payload: { section, sectionIndex } } = dispatch.mock.calls[1][0]

      expect(type).toBe("NEW_SECTION")
      expect(sectionIndex).toBe(1)
      expect(section.type).toBe("text")
      expect(section.body).toBe(afterHtml)
    })

    it("Can handle blockquotes with before and after sections", () => {
      getState = jest.fn(() => ({
        edit: { article, sectionIndex: 0 }
      }))
      onInsertBlockquote(blockquoteHtml, beforeHtml, afterHtml)(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      const afterSection = dispatch.mock.calls[1][0]
      expect(afterSection.type).toBe("NEW_SECTION")
      expect(afterSection.payload.sectionIndex).toBe(1)
      expect(afterSection.payload.section.type).toBe("text")
      expect(afterSection.payload.section.body).toBe(afterHtml)

      const beforeSection = dispatch.mock.calls[2][0]
      expect(beforeSection.type).toBe("NEW_SECTION")
      expect(beforeSection.payload.sectionIndex).toBe(0)
      expect(beforeSection.payload.section.type).toBe("text")
      expect(beforeSection.payload.section.body).toBe(beforeHtml)

      const setSection = dispatch.mock.calls[3][0]
      expect(setSection.type).toBe("SET_SECTION")
      expect(setSection.payload.sectionIndex).toBe(null)

      const changeSection = dispatch.mock.calls[4][0]
      expect(changeSection.type).toBe("CHANGE_SECTION")
      expect(changeSection.payload.key).toBe("body")
      expect(changeSection.payload.value).toBe(blockquoteHtml)
    })

    it("Calls save if a new section is added and unpublished", done => {
      article.published = false
      getState = jest.fn(() => ({
        edit: { article, },
        app: { channel: { type: "editorial" } },
      }))
      onInsertBlockquote(blockquoteHtml, beforeHtml, "")(dispatch, getState)
      expect(dispatch.mock.calls[1][0].type).toBe("NEW_SECTION")

      setTimeout(() => {
        dispatch.mock.calls[3][0](dispatch, getState)
        setTimeout(() => {
          expect(dispatch.mock.calls[4][0].type).toBe("SAVE_ARTICLE")
          done()
        }, 550)
      }, 550)
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
    })
    it("Calls #onMergeTextSections with new html if section before is text", () => {
      getState = jest.fn(() => ({
        edit: {
          article,
          section,
          sectionIndex
        }
      }))
      maybeMergeTextSections()(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)

      const { type, payload } = dispatch.mock.calls[3][0]
      expect(type).toBe("CHANGE_SECTION")
      expect(payload.value).toMatch("Around two years ago")
      expect(payload.value).toMatch("Land exhibitions, make influential contacts")
    })

    it("Does nothing if section before is not text", () => {
      sectionIndex = 3
      getState = jest.fn(() => ({
        edit: {
          article,
          section,
          sectionIndex
        }
      }))
      maybeMergeTextSections()(dispatch, getState)
      expect(dispatch).not.toBeCalled()
    })

    it("Strips blockquotes from html", () => {
      getState = jest.fn(() => ({
        edit: {
          article,
          section,
          sectionIndex
        }
      }))
      maybeMergeTextSections()(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)

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
          sectionIndex
        }
      }))
      onMergeTextSections("<p>New html</p>")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)
      const { type, payload } = dispatch.mock.calls[2][0]

      expect(type).toBe("CHANGE_SECTION")
      expect(payload.value).toMatch("<p>New html</p>")
    })

    it("Calls #removeSection", () => {
      getState = jest.fn(() => ({
        edit: {
          article,
          section,
          sectionIndex
        },
        app: { channel: { type: "editorial" } }
      }))
      onMergeTextSections("<p>New html</p>")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)
      dispatch.mock.calls[3][0](dispatch, getState)
      dispatch.mock.calls[4][0](dispatch, getState)
      const { type, payload: { data } } = dispatch.mock.calls[5][0]

      expect(type).toBe("CHANGE_ARTICLE")
      expect(data.sections.length).toBe(article.sections.length - 1)
    })
  })
})
