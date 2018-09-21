import React from "react"
import configureStore from "redux-mock-store"
import { NewsArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { NewsHeadline } from "@artsy/reaction/dist/Components/Publishing/News/NewsHeadline"
import { NewsByline } from "@artsy/reaction/dist/Components/Publishing/Byline/NewsByline"
import { Provider } from "react-redux"
import { mount } from "enzyme"
import { SectionList } from "../../section_list"
import { AddSource, EditNews } from "../news"
import { EditSourceControls } from "../../sections/news/EditSourceControls"

describe("EditNews", () => {
  let props

  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: props.channel,
      },
      edit: {
        article: props.article,
      },
    })

    return mount(
      <Provider store={store}>
        <EditNews {...props} onChangeArticleAction={() => {}} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      channel: { type: "editorial" },
      article: NewsArticle,
    }
  })

  it("Renders NewsHeadline", () => {
    const component = getWrapper(props)
    expect(component.find(NewsHeadline).exists()).toBe(true)
  })

  it("Renders SectionList", () => {
    const component = getWrapper(props)
    expect(component.find(SectionList).exists()).toBe(true)
  })

  it("Renders NewsByline", () => {
    const component = getWrapper(props)
    expect(component.find(NewsByline).exists()).toBe(true)
  })

  it("Renders AddSource if article has no source", () => {
    const article = Object.assign({}, NewsArticle)
    article.news_source = { title: null, url: null }

    const newProps = {
      channel: { type: "editorial" },
      article,
    }
    const component = getWrapper(newProps)

    expect(component.text()).toMatch("Add Source")
  })

  it("Renders source in byline if article has a source", () => {
    const component = getWrapper(props)
    expect(component.text()).toMatch("The New York Times")
  })

  it("Toggles EditSourceControls", () => {
    const component = getWrapper(props)

    expect(component.find(EditSourceControls).exists()).toBe(false)
    component.find(AddSource).simulate("click")
    expect(component.find(EditSourceControls).exists()).toBe(true)
  })
})
