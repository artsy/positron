import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { DropDownList } from "../../../../../components/drop_down/drop_down_list"
import { AdminArticle } from "../components/article"
import { AdminTags } from "../components/tags"
import { AdminVerticalsTags } from "../components/verticals_tags"
import { EditAdmin } from "../index"
require("typeahead.js")

beforeAll(() => {
  jest.mock("superagent", () => {
    return {
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      query: jest.fn().mockReturnValue({
        end: jest.fn(),
      }),
    }
  })
})

afterAll(() => {
  jest.clearAllMocks()
})

describe("EditAdmin", () => {
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const { article, channel } = passedProps

    const store = mockStore({
      app: { channel },
      edit: { article },
    })

    return mount(
      <Provider store={store}>
        <EditAdmin {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(FeatureArticle),
      channel: { type: "editorial" },
    }
  })

  it("Renders dropdown", () => {
    const component = getWrapper(props)
    expect(component.find(DropDownList).exists()).toBe(true)
  })

  it("Renders correct section for editorial", () => {
    props.isEditorial = true
    const component = getWrapper(props)

    expect(component.find(AdminArticle).exists()).toBe(true)
    expect(component.find(AdminVerticalsTags).exists()).toBe(true)
    expect(component.html()).toMatch("Featuring")
    expect(component.html()).toMatch("Additional Appearances")
    expect(component.html()).toMatch("Super Article")
    expect(component.html()).toMatch("Sponsor")

    expect(component.find(AdminTags).exists()).toBe(false)
  })

  it("Renders correct section for editorial news", () => {
    props.isEditorial = true
    props.isNews = true
    const component = getWrapper(props)

    expect(component.find(AdminArticle).exists()).toBe(true)
    expect(component.find(AdminVerticalsTags).exists()).toBe(true)
    expect(component.html()).toMatch("Featuring")

    expect(component.find(AdminTags).exists()).toBe(false)
    expect(component.html()).not.toMatch("Additional Appearances")
    expect(component.html()).not.toMatch("Super Article")
    expect(component.html()).not.toMatch("Sponsor")
  })

  it("Renders correct sections for non-editorial channels", () => {
    props.channel.type = "partner"
    const component = getWrapper(props)

    expect(component.find(AdminArticle).exists()).toBe(true)
    expect(component.find(AdminTags).exists()).toBe(true)
    expect(component.html()).toMatch("Featuring")
    expect(component.html()).toMatch("Additional Appearances")

    expect(component.find(AdminVerticalsTags).exists()).toBe(false)
    expect(component.html()).not.toMatch("Super Article")
    expect(component.html()).not.toMatch("Sponsor")
  })
})
