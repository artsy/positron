import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { CharacterLimit } from "client/components/character_limit"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { DisplaySearch } from "../search"

describe("DisplaySearch", () => {
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: passedProps.article,
      },
    })

    return mount(
      <Provider store={store}>
        <DisplaySearch {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(StandardArticle),
      onChangeArticleAction: jest.fn(),
    }
    props.article.search_title =
      "Virtual Reality Is the Most Powerful Artistic Medium of Our Time"
    props.article.search_description =
      "To create a total experience that will create a feeling that is qualitatively new"
  })

  it("Renders all form fields", () => {
    const component = getWrapper(props)
    expect(component.find(CharacterLimit).length).toBe(2)
  })

  it("Can display saved data", () => {
    const component = getWrapper(props)
    expect(component.html()).toMatch(props.article.search_title)
    expect(component.html()).toMatch(props.article.search_description)
  })

  it("Can change the thumbnail title", () => {
    const component = getWrapper(props)
    const input = component
      .find(CharacterLimit)
      .at(0)
      .getElement()
    input.props.onChange("New title")

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("search_title")
    expect(props.onChangeArticleAction.mock.calls[0][1]).toBe("New title")
  })

  it("Can change the description", () => {
    const component = getWrapper(props)
    const input = component
      .find(CharacterLimit)
      .at(1)
      .getElement()
    input.props.onChange("New description")

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe(
      "search_description"
    )
    expect(props.onChangeArticleAction.mock.calls[0][1]).toBe("New description")
  })
})
