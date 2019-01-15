import { Sans } from "@artsy/palette"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { AutocompleteListMetaphysics } from "client/components/autocomplete2/list_metaphysics"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { FeaturingMentioned } from "../featuring_mentioned"
import { MentionedList } from "../mentioned_list"
require("typeahead.js")

describe("FeaturingMentioned", () => {
  let props

  const getWrapper = (passedProps = props) => {
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
        <FeaturingMentioned {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(StandardArticle),
      featured: { artist: [], artwork: [] },
      mentioned: { artist: [], artwork: [] },
      model: "artist",
    }
  })

  it("Renders a label", () => {
    const component = getWrapper(props)

    expect(
      component
        .find(Sans)
        .first()
        .text()
    ).toBe("Artists")
  })

  it("Renders expected components", () => {
    const component = getWrapper(props)

    expect(component.find(AutocompleteListMetaphysics).exists()).toBe(true)
    expect(component.find(MentionedList).exists()).toBe(true)
  })
})
