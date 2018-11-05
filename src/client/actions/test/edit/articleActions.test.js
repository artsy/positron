import { cloneDeep } from "lodash"
import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import Backbone from "backbone"
import {
  changeArticleData,
  changeSavedStatus,
  deleteArticle,
  onAddFeaturedItem,
  onFirstSave,
  onChangeArticle,
  publishArticle,
  saveArticle,
  setMentionedItems,
} from "client/actions/edit/articleActions"
import Article from "client/models/article.coffee"

describe("articleActions", () => {
  let article

  beforeEach(() => {
    window.location.assign = jest.fn()
    article = cloneDeep(FeatureArticle)
  })

  document.body.innerHTML = `
    <div>
      <input id="edit-seo__focus-keyword" value="ceramics" />
    </div>'
  `

  describe("#changeArticleData", () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({
        edit: { article },
      }))
      dispatch = jest.fn()
    })

    it("Calls #changeArticle", () => {
      changeArticleData("title", "Title")(dispatch, getState)
      expect(dispatch.mock.calls[0][0].type).toBe("CHANGE_ARTICLE")
    })

    it("Can accept a key/value pair as args", () => {
      changeArticleData("title", "Title")(dispatch, getState)
      expect(dispatch.mock.calls[0][0].payload.data.title).toBe("Title")
    })

    it("Can accept a key/value pair with nested object as args", () => {
      changeArticleData("series.description", "Series Description")(
        dispatch,
        getState
      )
      expect(dispatch.mock.calls[0][0].payload.data.series.description).toBe(
        "Series Description"
      )
    })

    it("Can accept an object as args", () => {
      let data = {
        title: "Title",
        series: { description: "Series Description" },
      }
      changeArticleData(data)(dispatch, getState)
      expect(dispatch.mock.calls[0][0].payload.data.title).toBe("Title")
      expect(dispatch.mock.calls[0][0].payload.data.series.description).toBe(
        "Series Description"
      )
    })
  })

  it("#changeSavedStatus updates article and sets isSaved to arg", () => {
    article.title = "Cool article"
    const action = changeSavedStatus(article, true)

    expect(action.type).toBe("CHANGE_SAVED_STATUS")
    expect(action.payload.isSaved).toBe(true)
    expect(action.payload.article.title).toBe("Cool article")
  })

  describe("#deleteArticle", () => {
    let getState
    let dispatch

    beforeEach(() => {
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({ edit: { article } }))
      dispatch = jest.fn()
    })

    it("#deleteArticle destroys the article and sets isDeleting", () => {
      deleteArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe("DELETE_ARTICLE")
      expect(dispatch.mock.calls[0][0].payload.isDeleting).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe("delete")
    })
  })

  it("#onFirstSave forwards to the article url", () => {
    onFirstSave("12345")

    expect(window.location.assign.mock.calls[0][0]).toBe("/articles/12345/edit")
  })

  describe("#onChangeArticle", () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({
        edit: { article },
        app: { channel: { type: "editorial" } },
      }))
      dispatch = jest.fn()
    })

    it("calls #changeArticle with new attrs", () => {
      onChangeArticle("title", "New Title")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      expect(dispatch.mock.calls[1][0].type).toBe("CHANGE_ARTICLE")
      expect(dispatch.mock.calls[1][0].payload.data.title).toBe("New Title")
    })

    it("calls debounced #updateArticle with new attrs", done => {
      onChangeArticle("title", "New Title")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      setTimeout(() => {
        expect(dispatch.mock.calls[2][0].type).toBe("UPDATE_ARTICLE")
        expect(dispatch.mock.calls[2][0].key).toBe("userCurrentlyEditing")
        expect(dispatch.mock.calls[2][0].payload.article).toBe(article.id)
        done()
      }, 550)
    })

    it("does not call #saveArticle if published", () => {
      onChangeArticle("title", "New Title")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      expect(dispatch.mock.calls.length).toBe(2)
    })

    it("calls debounced #saveArticle if draft", done => {
      article.published = false
      onChangeArticle("title", "N")(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)
      onChangeArticle("title", "Ne")(dispatch, getState)
      dispatch.mock.calls[2][0](dispatch, getState)
      onChangeArticle("title", "New")(dispatch, getState)
      dispatch.mock.calls[4][0](dispatch, getState)

      setTimeout(() => {
        expect(dispatch.mock.calls.length).toBe(8)
        done()
      }, 550)
    })
  })

  describe("#publishArticle", () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, "set")

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({ edit: { article } }))
      dispatch = jest.fn()
    })

    it("Changes the publish status and saves the article", () => {
      getState = jest.fn(() => ({
        edit: { article: { published: false, id: "123" } },
      }))
      publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe("PUBLISH_ARTICLE")
      expect(dispatch.mock.calls[0][0].payload.isPublishing).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe("update")
      expect(Backbone.sync.mock.calls[0][1].get("published")).toBe(true)
    })

    it("Sets seo_keyword if publishing", () => {
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("SET_SEO_KEYWORD")
      expect(setArticleSpy.mock.calls[2][0].seo_keyword).toBe("ceramics")
    })

    it("Does not seo_keyword if unpublishing", () => {
      getState = jest.fn(() => ({ edit: { article: { published: true } } }))
      publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("REDIRECT_TO_LIST")
      expect(Backbone.sync.mock.calls[0][1].get("seo_keyword")).toBeFalsy()
    })

    it("Redirects to published list if publishing", () => {
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[2][0].type).toBe("REDIRECT_TO_LIST")
      expect(window.location.assign.mock.calls[0][0]).toBe(
        "/articles?published=true"
      )
    })

    it("Redirects to drafts list if unpublishing", () => {
      getState = jest.fn(() => ({ edit: { article: { published: true } } }))
      publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("REDIRECT_TO_LIST")
      expect(window.location.assign.mock.calls[0][0]).toBe(
        "/articles?published=false"
      )
    })
  })

  describe("#saveArticle", () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, "set")

    beforeEach(() => {
      setArticleSpy.mockClear()
      Article.prototype.isNew = jest.fn().mockReturnValue(false)
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({ edit: { article } }))
      dispatch = jest.fn()
    })

    it("Sets isSaving to true and saves the article", () => {
      saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe("SAVE_ARTICLE")
      expect(dispatch.mock.calls[0][0].payload.isSaving).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe("update")
    })

    it("Redirects to list if published", () => {
      getState = jest.fn(() => ({ edit: { article: { published: true } } }))
      saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[2][0].type).toBe("REDIRECT_TO_LIST")
      expect(window.location.assign.mock.calls[0][0]).toBe(
        "/articles?published=true"
      )
    })

    it("Does not redirect if unpublished", () => {
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      saveArticle()(dispatch, getState)

      expect(window.location.assign.mock.calls.length).toBe(0)
    })

    it("Sets seo_keyword if published", () => {
      getState = jest.fn(() => ({ edit: { article: { published: true } } }))
      saveArticle()(dispatch, getState)
      expect(dispatch.mock.calls[1][0].type).toBe("SET_SEO_KEYWORD")
      expect(setArticleSpy.mock.calls[1][0].seo_keyword).toBe("ceramics")
    })

    it("Does not seo_keyword if unpublished", () => {
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("SET_SEO_KEYWORD")
      expect(setArticleSpy.mock.calls.length).toBe(1)
      expect(setArticleSpy.mock.calls[0][0].seo_keyword).toBeFalsy()
    })

    it("Redirects to article if new", () => {
      Article.prototype.isNew.mockReturnValueOnce(true)
      Backbone.sync = jest.fn(() => {
        onFirstSave("12345")
      })
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      saveArticle()(dispatch, getState)
      expect(window.location.assign.mock.calls[0][0]).toBe(
        "/articles/12345/edit"
      )
    })
  })

  describe("#onAddFeaturedItem", () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({ edit: { article } }))
      dispatch = jest.fn()
    })

    it("Can add a featured artist", () => {
      onAddFeaturedItem("artist", { _id: "123" })(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("CHANGE_ARTICLE")
      expect(
        dispatch.mock.calls[1][0].payload.data.primary_featured_artist_ids[0]
      ).toBe("123")
    })

    it("Can add a featured artwork", () => {
      onAddFeaturedItem("artwork", { _id: "123" })(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe("CHANGE_ARTICLE")
      expect(
        dispatch.mock.calls[1][0].payload.data.featured_artwork_ids[0]
      ).toBe("123")
    })
  })

  describe("#setMentionedItems", () => {
    it("Can set mentioned artists", () => {
      const items = [{ name: "Joseph Beuys", _id: "123" }]
      const action = setMentionedItems("artist", items)

      expect(action.type).toBe("SET_MENTIONED_ITEMS")
      expect(action.payload.model).toBe("artist")
      expect(action.payload.items[0]).toBe(items[0])
    })

    it("Can set mentioned artworks", () => {
      const items = [{ title: "Stripes", _id: "123" }]
      const action = setMentionedItems("artwork", items)

      expect(action.type).toBe("SET_MENTIONED_ITEMS")
      expect(action.payload.model).toBe("artwork")
      expect(action.payload.items[0]).toBe(items[0])
    })
  })
})
