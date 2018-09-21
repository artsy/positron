import React from "react"
import { mount } from "enzyme"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import ArticleList from "../articles_list"

require("typeahead.js")

describe("ArticleList", () => {
  let props = null
  let component = null

  beforeEach(() => {
    props = {
      articles: [
        {
          id: "123",
          thumbnail_title: "Game of Thrones",
          thumbnail_image: "http://artsy.net/thumbnail_image.jpg",
          slug: "artsy-editorial-game-of-thrones",
        },
        {
          id: "124",
          thumbnail_title: "Email Game of Thrones",
          thumbnail_image: "http://artsy.net/thumbnail_image2.jpg",
          email_metadata: {
            headline: "Email of Thrones",
            image_url: "http://artsy.net/image_url.jpg",
          },
          slug: "artsy-editorial-email-of-thrones",
        },
        {
          id: "125",
          thumbnail_title: "[Draft] Draft Title",
          slug: "artsy-editorial-email-of-thrones",
        },
      ],
      published: true,
      selected: jest.fn(),
      checkable: true,
      user: {
        accessToken: "granted",
      },
      apiURL: "http://localhost:8080",
      viewArticlesAction: jest.fn(),
    }

    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {
          id: "test-channel",
          name: "Test Channel",
        },
      },
      articlesList: {
        articlesInSession: {},
      },
    })

    component = mount(
      <Provider store={store}>
        <ArticleList {...props} />
      </Provider>
    )
  })

  it("renders an initial set of articles", () => {
    expect(component.find(".paginated-list-item")).toHaveLength(3)
    expect(
      component
        .find(".paginated-list-item")
        .at(0)
        .text()
    ).toContain("Game of Thrones")
  })

  it("renders a link to /edit", () => {
    expect(
      component
        .find("a.article-list__article")
        .at(0)
        .prop("href")
    ).toEqual("/articles/123/edit")
  })

  it("selects the article when clicking the check button", () => {
    const element = component.find(".article-list__checkcircle").at(0)
    element.simulate("click")

    expect(props.selected.mock.calls[0][0].id).toEqual("123")
    expect(props.selected.mock.calls[0][0].thumbnail_title).toEqual(
      "Game of Thrones"
    )
    expect(props.selected.mock.calls[0][0].slug).toEqual(
      "artsy-editorial-game-of-thrones"
    )
  })

  it("check if user is available from redux", () => {
    expect(component.childAt(0).props().user).toEqual(props.user)
  })
})
