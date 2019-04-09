import { Spinner } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import Waypoint from "react-waypoint"
import configureStore from "redux-mock-store"
import ArticleList, { ArticlesList } from "../articles_list"
import { ArticlesListEmpty } from "../articles_list_empty"
import { ArticlesListHeader } from "../articles_list_header"
require("typeahead.js")

jest.mock("lodash/debounce", () => jest.fn(e => e))
jest.mock("superagent", () => {
  return {
    post: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnValue({
      end: jest.fn(),
    }),
  }
})
const requestMock = require("superagent")

describe("ArticleList", () => {
  let props
  let articles
  let end

  beforeEach(() => {
    end = jest.fn()
    requestMock.send.mockReturnValue({ end })
    articles = [
      // TODO: Replace with Reaction fixtures
      {
        id: "123",
        thumbnail_title: "Game of Thrones",
        thumbnail_image: "http://artsy.net/thumbnail_image.jpg",
        slug: "artsy-editorial-game-of-thrones",
        published: true,
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
        published: true,
      },
      {
        id: "125",
        thumbnail_title: "[Draft] Draft Title",
        slug: "artsy-editorial-email-of-thrones",
        published: true,
      },
    ] as ArticleData[]

    props = {
      articles,
      published: true,
      selected: jest.fn(),
      checkable: true,
      user: {
        access_token: "granted",
      },
      apiURL: "http://localhost:8080",
      viewArticlesAction: jest.fn(),
    }
  })

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {
          id: "test-channel",
          name: "Test Channel",
        },
        user: props.user,
        apiURL: "https://writer.artsy.net/api",
      },
      articlesList: {
        articlesInSession: {},
      },
    })
    return mount(
      <Provider store={store}>
        <ArticleList {...passedProps} />
      </Provider>
    )
  }

  it("renders an initial set of articles", () => {
    const component = getWrapper()
    expect(component.find(".paginated-list-item")).toHaveLength(3)
    expect(
      component
        .find(".paginated-list-item")
        .at(0)
        .text()
    ).toContain("Game of Thrones")
  })

  it("renders a link to /edit", () => {
    const component = getWrapper()
    expect(
      component
        .find("a.article-list__article")
        .at(0)
        .prop("href")
    ).toEqual("/articles/123/edit")
  })

  it("selects the article when clicking the check button", () => {
    const component = getWrapper()
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

  it("renders header", () => {
    const component = getWrapper()
    expect(component.find(ArticlesListHeader).length).toBe(1)
  })

  it("renders empty state", () => {
    props.articles = []
    const component = getWrapper()

    expect(component.find(ArticlesListEmpty).length).toBe(1)
  })

  it("check if user is available from redux", () => {
    const component = getWrapper()
    expect(component.childAt(0).props().user).toEqual(props.user)
  })

  it("renders loading state", () => {
    const component = getWrapper()
    const instance = component.find(ArticlesList).instance() as ArticlesList
    instance.setState({ isLoading: true })
    component.update()

    expect(component.find(Spinner).length).toBe(1)
  })

  it("calls #fetchArticles when entering waypoint", () => {
    const component = getWrapper()
    const instance = component.find(ArticlesList).instance() as ArticlesList
    instance.fetchFeed = jest.fn()
    const waypoint = component.find(Waypoint).at(0)
    waypoint.getElement().props.onEnter()

    expect(instance.fetchFeed).toBeCalled()
  })

  describe("#canLoadMore", () => {
    it("sets state.isLoading", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.setState = jest.fn((args, cb) => cb(args))
      instance.canLoadMore()

      expect(instance.setState).toBeCalledWith(
        { isLoading: true, offset: 10 },
        instance.fetchFeed
      )
    })

    it("calls #fetchFeed", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.fetchFeed = jest.fn()
      instance.canLoadMore()

      expect(instance.fetchFeed).toBeCalled()
    })
  })

  describe("#setResults", () => {
    it("updates state", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.setState = jest.fn()
      instance.setResults(props.articles as ArticleData[])

      expect(instance.setState).toBeCalledWith({
        articles,
        isLoading: false,
      })
    })
  })

  describe("#setPublished", () => {
    it("updates state", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.setState = jest.fn((args, cb) => cb(args))
      instance.setPublished(false)
      expect(instance.setState).toBeCalledWith(
        {
          articles: [],
          isLoading: true,
          isPublished: false,
          offset: 0,
        },
        instance.fetchFeed
      )
    })

    it("calls #fetchFeed", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.fetchFeed = jest.fn()
      instance.setPublished(false)

      expect(instance.fetchFeed).toBeCalled()
    })
  })

  describe("#appendMore", () => {
    it("updates state", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.setState = jest.fn()
      instance.appendMore(props.articles as ArticleData[])
      // @ts-ignore
      expect(instance.setState.mock.calls[0][0].articles.length).toBe(6)
    })
  })

  describe("#fetchFeed", () => {
    it("constructs api url correctly", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.fetchFeed()

      expect(requestMock.post).toBeCalledWith(
        "https://writer.artsy.net/api/graphql"
      )
    })

    it("calls api with expected query for published articles", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.fetchFeed()

      expect(requestMock.send).toBeCalledWith({
        query: `
    {
      articles(
      published: true,
      offset: 0,
      channel_id: \"test-channel\"
    ){
        thumbnail_image
        thumbnail_title
        slug
        published_at
        published
        scheduled_publish_at
        id
        channel_id
        partner_channel_id
        updated_at
        layout
      }
    }
  `,
      })
    })

    it("calls api with expected query for unpublished articles", () => {
      props.published = false
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.fetchFeed()

      expect(requestMock.send).toBeCalledWith({
        query: `
    {
      articles(
      published: false,
      offset: 0,
      channel_id: \"test-channel\"
    ){
        thumbnail_image
        thumbnail_title
        slug
        published_at
        published
        scheduled_publish_at
        id
        channel_id
        partner_channel_id
        updated_at
        layout
      }
    }
  `,
      })
    })

    it("sets user access token", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.fetchFeed()

      expect(requestMock.set).toBeCalledWith("X-Access-Token", "granted")
    })

    it("can handle empty users", () => {
      props.user = null
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.fetchFeed()

      expect(requestMock.set).toBeCalledWith("X-Access-Token", undefined)
    })

    it("can handle errors", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.appendMore = jest.fn()
      instance.fetchFeed()

      end.mock.calls[0][0]({ message: "an error" }, {})
      expect(instance.appendMore).not.toBeCalledWith()
    })

    it("calls the callback with results", () => {
      const instance = getWrapper()
        .find(ArticlesList)
        .instance() as ArticlesList
      instance.appendMore = jest.fn()
      instance.fetchFeed()

      end.mock.calls[0][0](null, { body: { data: { articles } } })
      expect(instance.appendMore).toBeCalledWith(articles)
    })
  })
})
