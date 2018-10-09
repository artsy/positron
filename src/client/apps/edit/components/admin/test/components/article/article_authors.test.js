import configureStore from "redux-mock-store"
import request from "superagent"
import { cloneDeep, extend } from "lodash"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { ArticleAuthors } from "../../../components/article/article_authors"
import { AutocompleteList } from "/client/components/autocomplete2/list"
import { AutocompleteListMetaphysics } from "client/components/autocomplete2/list_metaphysics"
require("typeahead.js")

jest.mock("superagent", () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.fn().mockReturnValue({
      end: jest.fn(),
    }),
  }
})

describe("ArticleAuthors", () => {
  let props
  let response

  const getWrapper = props => {
    const mockStore = configureStore([])
    const { article, channel } = props

    const store = mockStore({
      app: { channel },
      edit: { article },
    })

    return mount(
      <Provider store={store}>
        <ArticleAuthors {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    let article = extend(cloneDeep(StandardArticle), {
      author: { name: "Artsy Editorial", id: "123" },
    })

    props = {
      article,
      channel: { type: "editorial" },
      onChangeArticleAction: jest.fn(),
    }

    response = {
      body: {
        data: {
          authors: [
            {
              id: "123",
              name: "Casey Lesser",
            },
          ],
        },
      },
    }
  })

  it("Renders primary authors input", () => {
    const component = getWrapper(props)
    const input = component
      .find("input")
      .at(0)
      .getElement().props

    expect(input.defaultValue).toBe(props.article.author.name)
  })

  it("Renders authors autocomplete", () => {
    const component = getWrapper(props)
    expect(component.find(AutocompleteList).exists()).toBe(true)
  })

  it("Renders contributing authors autocomplete", () => {
    const component = getWrapper(props)
    expect(component.find(AutocompleteListMetaphysics).length).toBe(1)
  })

  it("Does not render contributing authors if layout is news", () => {
    props.article.layout = "news"
    const component = getWrapper(props)
    expect(component.find(AutocompleteListMetaphysics).length).toBeFalsy()
  })

  it("#fetchAuthors fetches authors", () => {
    props.article.author_ids = ["123"]
    const callback = jest.fn()
    request.query().end.mockImplementation(() => {
      callback(response.body.data.authors)
    })
    const component = getWrapper(props).find(ArticleAuthors)

    component.instance().fetchAuthors()
    expect(callback).toBeCalled()
  })

  it("Can change a primary author", () => {
    const component = getWrapper(props)
    const value = "New Author"
    component
      .find("input")
      .at(0)
      .simulate("change", { target: { value } })

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("author")
    expect(props.onChangeArticleAction.mock.calls[0][1].name).toBe(value)
  })
})
