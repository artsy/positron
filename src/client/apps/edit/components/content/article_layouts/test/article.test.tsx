import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { SectionList } from "../../section_list"
import { SectionFooter } from "../../sections/footer"
import { SectionHeader } from "../../sections/header"
import { SectionHero } from "../../sections/hero"
import { EditArticle } from "../article"

describe("EditArticle", () => {
  let props

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: passedProps.channel,
      },
      edit: {
        article: passedProps.article,
      },
    })

    return mount(
      <Provider store={store}>
        <EditArticle {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      channel: { type: "editorial" },
      article: FeatureArticle,
    }
  })

  it("Does not render SectionHero if channel does not have feature", () => {
    const component = getWrapper()

    expect(component.find(SectionHero).exists()).toBe(false)
  })

  it("Renders SectionHero if channel has feature", () => {
    props.channel.type = "team"
    const component = getWrapper()
    expect(component.find(SectionHero).exists()).toBe(true)
  })

  it("Renders SectionHeader", () => {
    const component = getWrapper()
    expect(component.find(SectionHeader).exists()).toBe(true)
  })

  it("Renders SectionList", () => {
    const component = getWrapper()
    expect(component.find(SectionList).exists()).toBe(true)
  })

  it("Renders SectionFooter", () => {
    const component = getWrapper()
    expect(component.find(SectionFooter).exists()).toBe(true)
  })
})
