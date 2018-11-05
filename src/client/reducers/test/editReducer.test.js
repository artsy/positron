import { cloneDeep, extend } from "lodash"
import { data as sd } from "sharify"
import { editReducer, setupArticle } from "../editReducer"
import { actions } from "client/actions/edit"
import { setupSection } from "client/actions/edit/sectionActions"
import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"

describe("editReducer", () => {
  let initialState
  let initialSections

  beforeEach(() => {
    initialState = editReducer(undefined, { payload: {} })
    initialSections = cloneDeep(FeatureArticle.sections)
    initialState.article = cloneDeep(FeatureArticle)
  })

  it("should return the initial state", () => {
    expect(initialState.article).toEqual(FeatureArticle)
    expect(initialState.activeView).toBe("content")
    expect(initialState.error).toBe(null)
    expect(initialState.isDeleting).toBe(false)
    expect(initialState.isPublishing).toBe(false)
    expect(initialState.isSaving).toBe(false)
    expect(initialState.isSaved).toBe(true)
    expect(initialState.section).toBe(null)
    expect(initialState.sectionIndex).toBe(null)
  })

  it("#setupArticle should cleanup the author and set author_id", () => {
    sd.ARTICLE.author = extend(sd.ARTICLE.author, { twitter_handle: "@artsy" })
    const article = setupArticle()

    expect(sd.ARTICLE.author.twitter_handle).toBeFalsy()
    expect(article.author_id).toBe(sd.USER.id)
  })

  describe("Sections", () => {
    it("SET_SECTION adds editing section and sectionIndex to state", () => {
      const sectionIndex = 2
      const updatedState = editReducer(initialState, {
        type: actions.SET_SECTION,
        payload: {
          sectionIndex,
        },
      })

      expect(updatedState.sectionIndex).toBe(sectionIndex)
      expect(updatedState.section).toEqual(initialSections[sectionIndex])
    })

    it("NEW_SECTION should insert a section into article.sections", () => {
      const section = setupSection("text")
      const sectionIndex = 2

      const updatedState = editReducer(initialState, {
        type: actions.NEW_SECTION,
        payload: {
          section,
          sectionIndex,
        },
      })

      expect(updatedState.sectionIndex).toBe(sectionIndex)
      expect(updatedState.section.type).toBe(section.type)
      expect(updatedState.section.body).toBe(section.body)
      expect(updatedState.article.sections[sectionIndex]).toBe(section)
      expect(updatedState.article.sections[3]).toEqual(initialSections[2])
      expect(updatedState.article.sections.length).toBe(
        initialSections.length + 1
      )
    })

    it("NEW_SECTION can add a section to an article without sections", () => {
      initialState.article = extend(cloneDeep(initialState.article), {
        sections: null,
      })
      const section = setupSection("text")
      const sectionIndex = 0

      const updatedState = editReducer(initialState, {
        type: actions.NEW_SECTION,
        payload: {
          section,
          sectionIndex,
        },
      })

      expect(updatedState.sectionIndex).toBe(sectionIndex)
      expect(updatedState.section.type).toBe(section.type)
      expect(updatedState.section.body).toBe(section.body)
      expect(updatedState.article.sections[sectionIndex]).toBe(section)
      expect(updatedState.article.sections.length).toBe(1)
    })

    it("CHANGE_SECTION should update section keys and reset article.sections", () => {
      const stateWithSection = extend(cloneDeep(initialState), {
        section: cloneDeep(initialSections[0]),
        sectionIndex: 0,
      })
      const key = "body"
      const value = "<p>A new piece of text.</p>"

      const updatedState = editReducer(stateWithSection, {
        type: actions.CHANGE_SECTION,
        payload: {
          key,
          value,
        },
      })
      expect(updatedState.section.body).toMatch(value)
      expect(updatedState.article.sections[0].body).toMatch(value)
    })
  })
})
