import {
  changeView,
  redirectToList,
  setYoastKeyword,
  startEditingArticle,
  stopEditingArticle,
  toggleSpinner,
  updateArticle,
} from "client/actions/edit/editActions"
import $ from "jquery"

describe("editActions", () => {
  beforeEach(() => {
    window.location.assign = jest.fn()
  })

  document.body.innerHTML = `
    <div id="edit-sections-spinner" />
  `

  it("#changeView sets the activeView to arg", () => {
    const action = changeView("display")

    expect(action).toEqual({
      type: "CHANGE_VIEW",
      payload: { activeView: "display" },
    })
  })

  it("#setYoastKeyword sets the yoast keyword", () => {
    const action = setYoastKeyword("photography")

    expect(action).toEqual({
      type: "SET_YOAST_KEYWORD",
      payload: { yoastKeyword: "photography" },
    })
  })

  describe("#redirectToList", () => {
    it("Can forward /articles with published arg", () => {
      redirectToList(true)
      expect(window.location.assign).toBeCalledWith("/articles?published=true")
    })

    it("Can forward /articles with unpublished arg", () => {
      redirectToList(false)
      expect(window.location.assign).toBeCalledWith("/articles?published=false")
    })
  })

  describe("#toggleSpinner", () => {
    it("Can shows the loading spinner", () => {
      const action = toggleSpinner(true)

      expect(action).toEqual({
        type: "TOGGLE_SPINNER",
      })
      expect($("#edit-sections-spinner").css("display")).toBe("block")
    })

    it("Can hide the loading spinner", () => {
      const action = toggleSpinner(false)

      expect(action).toEqual({
        type: "TOGGLE_SPINNER",
      })
      expect($("#edit-sections-spinner").css("display")).toBe("none")
    })
  })

  describe("Article lockout", () => {
    let data
    global.Date = jest.fn(() => ({
      toISOString: () => "2019-03-19T20:33:06.821Z",
    })) as any

    beforeEach(() => {
      data = {
        user: {
          name: "Molly Gottshalk",
          id: "123",
        },
        channel: {
          name: "Artsy Editorial",
          type: "editorial",
          id: "234",
        },
        article: "345",
      }
    })
    it("#startEditingArticle returns expected data", () => {
      const action = startEditingArticle(data)

      expect(action).toEqual({
        type: "START_EDITING_ARTICLE",
        key: "userStartedEditing",
        payload: {
          timestamp: "2019-03-19T20:33:06.821Z",
          user: { name: "Molly Gottshalk", id: "123" },
          channel: { name: "Artsy Editorial", type: "editorial", id: "234" },
          article: "345",
        },
      })
    })

    it("#updateArticle returns expected data", () => {
      const action = updateArticle(data)

      expect(action).toEqual({
        type: "UPDATE_ARTICLE",
        key: "userCurrentlyEditing",
        payload: {
          timestamp: "2019-03-19T20:33:06.821Z",
          user: { name: "Molly Gottshalk", id: "123" },
          channel: { name: "Artsy Editorial", type: "editorial", id: "234" },
          article: "345",
        },
      })
    })

    it("#stopEditingArticle returns expected data", () => {
      const action = stopEditingArticle(data)

      expect(action).toEqual({
        type: "STOP_EDITING_ARTICLE",
        key: "userStoppedEditing",
        payload: {
          timestamp: "2019-03-19T20:33:06.821Z",
          user: { name: "Molly Gottshalk", id: "123" },
          channel: { name: "Artsy Editorial", type: "editorial", id: "234" },
          article: "345",
        },
      })
    })
  })
})
