import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { AutocompleteListMetaphysics } from "../../../../../../components/autocomplete2/list_metaphysics.js"
import { AdminAppearances } from "../../components/appearances"
require("typeahead.js")

describe("FeaturingMentioned", () => {
  let props

  const getWrapper = passedProps => {
    const mockStore = configureStore([])
    const { article } = passedProps

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: { article },
    })

    return mount(
      <Provider store={store}>
        <AdminAppearances {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(StandardArticle),
    }
  })

  it("Renders autocomplete components", () => {
    const component = getWrapper(props)
    expect(component.find(AutocompleteListMetaphysics).length).toBe(4)
  })
})
