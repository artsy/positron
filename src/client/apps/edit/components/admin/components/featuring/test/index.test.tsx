import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { AutocompleteList } from "../../../../../../../components/autocomplete2/list"
import { FeaturingMentioned } from "../featuring_mentioned"
import { AdminFeaturing } from "../index"
require("typeahead.js")

describe("AdminFeaturing", () => {
  let props
  const getWrapper = passedProps => {
    const mockStore = configureStore([])
    const { article, featured, mentioned } = passedProps

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article,
        featured,
        mentioned,
      },
    })

    return mount(
      <Provider store={store}>
        <AdminFeaturing {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    const article = cloneDeep(StandardArticle)

    props = {
      article,
      featured: {
        artist: [
          {
            _id: "123",
            name: "Pablo Picasso",
          },
        ],
        artwork: [],
      },
      mentioned: { artist: [], artwork: [] },
      metaphysicsURL: "https://metaphysics-staging.artsy.net",
      model: "artist",
      onChangeArticleAction: jest.fn(),
    }
  })

  it("Renders autocomplete fields", () => {
    const component = getWrapper(props)
    expect(component.find(AutocompleteList).length).toBe(6)
  })

  it("Renders feature/mentioned fields", () => {
    const component = getWrapper(props)
    expect(component.find(FeaturingMentioned).length).toBe(2)
  })
})
