import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { actions } from "client/actions/edit"
import { setupSection } from "client/actions/edit/sectionActions"
import { cloneDeep, extend } from "lodash"
import { data as sd } from "sharify"
import { editReducer, setupArticle, setupYoastKeyword } from "../editReducer"

describe("editReducer", () => {
  let initialState
  let initialSections

  beforeEach(() => {
    initialState = editReducer(undefined, { payload: {} })
    initialSections = cloneDeep(FeatureArticle.sections)
    initialState.article = cloneDeep(FeatureArticle)
    sd.ARTICLE = cloneDeep(FeatureArticle)
  })

  describe("#setupArticle", () => {
    it("Sets the article state from SD.ARTICLE", () => {
      const article = setupArticle()
      expect(article).toEqual(sd.ARTICLE)
    })

    it("Sets the article state to null if no SD.ARTICLE", () => {
      delete sd.ARTICLE
      const article = setupArticle()
      expect(article).toEqual(null)
    })

    it("#setupArticle should cleanup the author and set author_id", () => {
      sd.ARTICLE.author = extend(sd.ARTICLE.author, {
        twitter_handle: "@artsy",
      })
      const article = setupArticle()

      expect(sd.ARTICLE.author.twitter_handle).toBeFalsy()
      expect(article.author_id).toBe(sd.USER.id)
    })
  })

  describe("#setupYoastKeyword", () => {
    it("Returns sd.ARTICLE.seo_keyword", () => {
      sd.ARTICLE.seo_keyword = "ceramics"
      expect(setupYoastKeyword()).toBe("ceramics")
    })

    it("Returns an empty string if no sd.ARTICLE.seo_keyword", () => {
      expect(setupYoastKeyword()).toBe("")
    })
  })

  describe("editReducer", () => {
    it("Returns the initial state", () => {
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

    describe("CHANGE_SAVED_STATUS", () => {
      it("Sets isSaving to false", () => {
        const article = initialState.article
        const updatedState = editReducer(initialState, {
          type: actions.CHANGE_SAVED_STATUS,
          payload: {
            article,
            isSaved: false,
          },
        })
        expect(updatedState.isSaving).toBe(false)
      })

      it("Sets isSaved to payload.isSaved", () => {
        const article = initialState.article
        const updatedState = editReducer(initialState, {
          type: actions.CHANGE_SAVED_STATUS,
          payload: {
            article,
            isSaved: false,
          },
        })
        expect(updatedState.isSaved).toBe(false)
      })

      it("Updates the article with payload.article", () => {
        // TODO: maybe not necessary to pass article
        const article = initialState.article
        article.title = "new title"
        const updatedState = editReducer(initialState, {
          type: actions.CHANGE_SAVED_STATUS,
          payload: {
            article,
            isSaved: false,
          },
        })
        expect(updatedState.article.title).toBe("new title")
      })
    })

    describe("CHANGE_VIEW", () => {
      it("Sets activeView to payload.activeView", () => {
        const updatedState = editReducer(initialState, {
          type: actions.CHANGE_VIEW,
          payload: {
            activeView: "display",
          },
        })
        expect(updatedState.activeView).toBe("display")
      })
    })

    describe("CHANGE_ARTICLE", () => {
      it("Sets isSaved to false", () => {
        const article = initialState.article
        article.title = "new title"
        const updatedState = editReducer(initialState, {
          type: actions.CHANGE_ARTICLE,
          payload: {
            data: article,
          },
        })
        expect(updatedState.isSaved).toBe(false)
      })

      it("Sets article to payload.data", () => {
        const article = initialState.article
        article.title = "new title"
        const updatedState = editReducer(initialState, {
          type: actions.CHANGE_ARTICLE,
          payload: {
            data: article,
          },
        })
        expect(updatedState.article.title).toBe("new title")
      })
    })

    describe("DELETE_ARTICLE", () => {
      it("Sets isDeleting to payload.isDeleting", () => {
        const updatedState = editReducer(initialState, {
          type: actions.DELETE_ARTICLE,
          payload: {
            isDeleting: true,
          },
        })
        expect(updatedState.isDeleting).toBe(true)
      })
    })

    describe("ERROR", () => {
      it("Sets error to payload.error", () => {
        const updatedState = editReducer(initialState, {
          type: actions.ERROR,
          payload: {
            error: { message: "new error" },
          },
        })
        expect(updatedState.error.message).toBe("new error")
      })
    })

    describe("PUBLISH_ARTICLE", () => {
      it("Sets isPublishing to payload.isPublishing", () => {
        const updatedState = editReducer(initialState, {
          type: actions.PUBLISH_ARTICLE,
          payload: {
            isPublishing: true,
          },
        })
        expect(updatedState.isPublishing).toBe(true)
      })
    })

    describe("SAVE_ARTICLE", () => {
      it("Sets isSaving to true", () => {
        const updatedState = editReducer(initialState, {
          type: actions.SAVE_ARTICLE,
        })
        expect(updatedState.isSaving).toBe(true)
      })
    })

    describe("SET_YOAST_KEYWORD", () => {
      it("adds the yoast keyword to state", () => {
        const yoastKeyword = "test"
        const updatedState = editReducer(initialState, {
          type: actions.SET_YOAST_KEYWORD,
          payload: {
            yoastKeyword,
          },
        })

        expect(updatedState.yoastKeyword).toBe(yoastKeyword)
      })
    })

    describe("SET_MENTIONED_ITEMS", () => {
      it("Sets artist items to state", () => {
        const items = [{ name: "Pablo Picasso", id: "123" }]
        const updatedState = editReducer(initialState, {
          type: actions.SET_MENTIONED_ITEMS,
          payload: {
            items,
            model: "artist",
          },
        })
        expect(updatedState.mentioned.artist).toBe(items)
      })

      it("Sets artwork items to state", () => {
        const items = [{ title: "Guernica", id: "234" }]
        const updatedState = editReducer(initialState, {
          type: actions.SET_MENTIONED_ITEMS,
          payload: {
            items,
            model: "artwork",
          },
        })
        expect(updatedState.mentioned.artwork).toBe(items)
      })
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

      describe("NEW_SECTION", () => {
        it("inserts a section into article.sections", () => {
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

        it("can add a section to an article without sections", () => {
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
      })

      describe("CHANGE_SECTION", () => {
        let stateWithSection
        let key
        let value

        beforeEach(() => {
          stateWithSection = extend(cloneDeep(initialState), {
            section: cloneDeep(initialSections[0]),
            sectionIndex: 0,
          })
          key = "body"
          value = "<p>A new piece of text.</p>"
        })

        it("updates section keys and reset article.sections", () => {
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

        it("sets isSaved to false", () => {
          const updatedState = editReducer(stateWithSection, {
            type: actions.CHANGE_SECTION,
            payload: {
              key,
              value,
            },
          })
          expect(updatedState.isSaved).toBe(false)
        })
      })
    })
  })
})
