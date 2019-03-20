import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import Backbone from "backbone"
import {
  changeArticleData,
  changeSavedStatus,
  deleteArticle,
  onAddFeaturedItem,
  onChangeArticle,
  onFirstSave,
  publishArticle,
  saveArticle,
  setMentionedItems,
  setSeoKeyword,
} from "client/actions/edit/articleActions"
import { cloneDeep } from "lodash"
const Article = require("client/models/article.coffee")

jest.mock("lodash/debounce", () => jest.fn(e => e))

describe("articleActions", () => {
  let article

  beforeEach(() => {
    window.location.assign = jest.fn()
    article = cloneDeep(FeatureArticle)
  })

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

      expect(dispatch).toBeCalledWith({
        type: "CHANGE_ARTICLE",
        payload: { data: { title: "Title" } },
      })
    })

    it("Can accept a key/value pair as args", () => {
      changeArticleData("title", "Title")(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        type: "CHANGE_ARTICLE",
        payload: { data: { title: "Title" } },
      })
    })

    it("Can accept a key/value pair with nested object as args", () => {
      changeArticleData("series.description", "Series Description")(
        dispatch,
        getState
      )

      expect(dispatch).toBeCalledWith({
        type: "CHANGE_ARTICLE",
        payload: { data: { series: { description: "Series Description" } } },
      })
    })

    it("Can accept an object as args", () => {
      const data = {
        title: "Title",
        series: { description: "Series Description" },
      }
      changeArticleData(data)(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        type: "CHANGE_ARTICLE",
        payload: {
          data: {
            title: "Title",
            series: { description: "Series Description" },
          },
        },
      })
    })
  })

  it("#changeSavedStatus updates article and sets isSaved to arg", () => {
    const action = changeSavedStatus(article, true)

    expect(action).toEqual({
      type: "CHANGE_SAVED_STATUS",
      payload: {
        isSaved: true,
        article,
      },
    })
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

      expect(dispatch).toBeCalledWith({
        type: "DELETE_ARTICLE",
        payload: { isDeleting: true },
      })
      expect(Backbone.sync.mock.calls[0][0]).toBe("delete")
    })
  })

  it("#onFirstSave forwards to the article url", () => {
    onFirstSave("12345")

    expect(window.location.assign).toBeCalledWith("/articles/12345/edit")
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
      Backbone.sync = jest.fn()
    })

    it("calls #changeArticleData with new attrs", () => {
      onChangeArticle("title", "New Title")(dispatch, getState)
      const dispatchedChangeArticleData = dispatch.mock.calls[0][0]
      dispatch.mockClear()
      dispatchedChangeArticleData(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        payload: { data: { title: "New Title" } },
        type: "CHANGE_ARTICLE",
      })
    })

    it("calls debounced #updateArticle with new attrs", () => {
      global.Date = jest.fn(() => ({
        toISOString: () => "2019-03-19T20:33:06.821Z",
      })) as any
      onChangeArticle("title", "New Title")(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        type: "UPDATE_ARTICLE",
        key: "userCurrentlyEditing",
        payload: {
          article: "594a7e2254c37f00177c0ea9",
          channel: {
            type: "editorial",
          },
          timestamp: "2019-03-19T20:33:06.821Z",
        },
      })
    })

    it("does not call #saveArticle if published", () => {
      onChangeArticle("title", "New Title")(dispatch, getState)
      const dispatchedChangeArticleData = dispatch.mock.calls[0][0]
      dispatch.mockClear()
      dispatchedChangeArticleData(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        payload: { data: { title: "New Title" } },
        type: "CHANGE_ARTICLE",
      })
      expect(Backbone.sync).not.toBeCalled()
    })

    it("calls debounced #saveArticle if draft", async () => {
      article.published = false
      onChangeArticle("title", "New title")(dispatch, getState)
      const dispatchedChangeArticleData = dispatch.mock.calls[0][0]
      dispatchedChangeArticleData(dispatch, getState)
      const dispatchedSaveArticle = dispatch.mock.calls[2][0]
      dispatchedSaveArticle(dispatch, getState)

      expect(Backbone.sync.mock.calls[0][0]).toBe("update")
    })
  })

  describe("#publishArticle", () => {
    let getState
    let dispatch
    const setArticleSpy = jest.spyOn(Article.prototype, "set")

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

      expect(dispatch).toBeCalledWith({
        type: "PUBLISH_ARTICLE",
        payload: { isPublishing: true },
      })
      expect(Backbone.sync.mock.calls[0][0]).toBe("update")
      expect(Backbone.sync.mock.calls[0][1].get("published")).toBe(true)
    })

    it("calls setSeoKeyword if publishing", () => {
      getState = jest.fn(() => ({
        edit: { article: { published: true }, yoastKeyword: "ceramics" },
      }))
      saveArticle()(dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)

      expect(setArticleSpy.mock.calls.length).toBe(2)
      expect(setArticleSpy).toHaveBeenLastCalledWith({
        seo_keyword: "ceramics",
      })
    })

    it("Does not call setSeoKeyword if unpublishing", () => {
      getState = jest.fn(() => ({
        edit: { article: { published: false }, yoastKeyword: "ceramics" },
      }))
      saveArticle()(dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)

      expect(setArticleSpy.mock.calls.length).toBe(1)
      expect(setArticleSpy).toBeCalledWith(
        {
          published: false,
        },
        {}
      )
    })

    it("Redirects to published list if publishing", () => {
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      publishArticle()(dispatch, getState)

      expect(dispatch).toHaveBeenLastCalledWith({ type: "REDIRECT_TO_LIST" })
      expect(window.location.assign).toBeCalledWith("/articles?published=true")
    })

    it("Redirects to drafts list if unpublishing", () => {
      getState = jest.fn(() => ({ edit: { article: { published: true } } }))
      publishArticle()(dispatch, getState)

      expect(dispatch).toHaveBeenLastCalledWith({ type: "REDIRECT_TO_LIST" })
      expect(window.location.assign).toBeCalledWith("/articles?published=false")
    })
  })

  describe("#setSeoKeyword", () => {
    let getState
    let dispatch
    const setArticleSpy = jest.spyOn(Article.prototype, "set")

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      dispatch = jest.fn()
    })

    it("sets an seo keyword for a published article", () => {
      getState = jest.fn(() => ({
        edit: { article: { published: true }, yoastKeyword: "ceramics" },
      }))

      setSeoKeyword(new Article(article))(dispatch, getState)

      expect(setArticleSpy.mock.calls.length).toBe(2)
      expect(setArticleSpy).toHaveBeenLastCalledWith({
        seo_keyword: "ceramics",
      })
    })

    it("doesn't set an seo keyword for an unpublished article", () => {
      getState = jest.fn(() => ({
        edit: { article: { published: false }, yoastKeyword: "ceramics" },
      }))

      article.published = false
      setSeoKeyword(new Article(article))(dispatch, getState)

      expect(setArticleSpy.mock.calls.length).toBe(1)
    })
  })

  describe("#saveArticle", () => {
    let getState
    let dispatch
    const setArticleSpy = jest.spyOn(Article.prototype, "set")

    beforeEach(() => {
      setArticleSpy.mockClear()
      Article.prototype.isNew = jest.fn().mockReturnValue(false)
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({ edit: { article } }))
      dispatch = jest.fn()
    })

    it("Sets isSaving to true and saves the article", () => {
      saveArticle()(dispatch, getState)

      expect(dispatch).toBeCalledWith({
        type: "SAVE_ARTICLE",
        payload: { isSaving: true },
      })
      expect(Backbone.sync.mock.calls[0][0]).toBe("update")
    })

    it("Redirects to list if published", () => {
      getState = jest.fn(() => ({ edit: { article: { published: true } } }))
      saveArticle()(dispatch, getState)

      expect(dispatch).toHaveBeenLastCalledWith({ type: "REDIRECT_TO_LIST" })
      expect(window.location.assign).toBeCalledWith("/articles?published=true")
    })

    it("Does not redirect if unpublished", () => {
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      saveArticle()(dispatch, getState)

      expect(window.location.assign).not.toBeCalled()
    })

    it("calls setSeoKeyword if published", () => {
      getState = jest.fn(() => ({
        edit: { article: { published: true }, yoastKeyword: "ceramics" },
      }))
      saveArticle()(dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)

      expect(setArticleSpy).toHaveBeenLastCalledWith({
        seo_keyword: "ceramics",
      })
      expect(setArticleSpy.mock.calls.length).toBe(2)
      expect(dispatch.mock.calls.length).toBe(3)
    })

    it("Does not call setSeoKeyword if unpublished", () => {
      getState = jest.fn(() => ({
        edit: { article: { published: false }, yoastKeyword: "ceramics" },
      }))
      saveArticle()(dispatch, getState)
      dispatch.mock.calls[1][0](dispatch, getState)

      expect(setArticleSpy.mock.calls.length).toBe(1)
      expect(dispatch.mock.calls.length).toBe(2)
    })

    it("Redirects to article if new", () => {
      Article.prototype.isNew.mockReturnValueOnce(true)
      Backbone.sync = jest.fn(() => {
        onFirstSave("12345")
      })
      getState = jest.fn(() => ({ edit: { article: { published: false } } }))
      saveArticle()(dispatch, getState)
      expect(window.location.assign).toBeCalledWith("/articles/12345/edit")
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

      expect(dispatch).toHaveBeenLastCalledWith({
        type: "CHANGE_ARTICLE",
        payload: {
          data: { primary_featured_artist_ids: ["123"] },
        },
      })
    })

    it("Can add a featured artwork", () => {
      onAddFeaturedItem("artwork", { _id: "123" })(dispatch, getState)
      dispatch.mock.calls[0][0](dispatch, getState)

      expect(dispatch).toHaveBeenLastCalledWith({
        type: "CHANGE_ARTICLE",
        payload: {
          data: { featured_artwork_ids: ["123"] },
        },
      })
    })
  })

  describe("#setMentionedItems", () => {
    it("Can set mentioned artists", () => {
      const items = [{ name: "Joseph Beuys", _id: "123" }]
      const action = setMentionedItems("artist", items)

      expect(action).toEqual({
        type: "SET_MENTIONED_ITEMS",
        payload: {
          model: "artist",
          items: [{ _id: "123", name: "Joseph Beuys" }],
        },
      })
    })

    it("Can set mentioned artworks", () => {
      const items = [{ title: "Stripes", _id: "123" }]
      const action = setMentionedItems("artwork", items)

      expect(action).toEqual({
        type: "SET_MENTIONED_ITEMS",
        payload: {
          model: "artwork",
          items: [{ _id: "123", title: "Stripes" }],
        },
      })
    })
  })
})
