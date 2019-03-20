import {
  changeView,
  redirectToList,
  setYoastKeyword,
  toggleSpinner,
} from "client/actions/edit/editActions"
import $ from "jquery"

describe("editActions", () => {
  beforeEach(() => {
    window.location.assign = jest.fn()
  })

  document.body.innerHTML = `
    <div id="edit-sections-spinner" />
  `

  // TODO: ARTICLE LOCKOUT ACTIONS

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
      toggleSpinner(true)
      expect($("#edit-sections-spinner").css("display")).toBe("block")
    })

    it("Can hide the loading spinner", () => {
      toggleSpinner(false)
      expect($("#edit-sections-spinner").css("display")).toBe("none")
    })
  })
})
