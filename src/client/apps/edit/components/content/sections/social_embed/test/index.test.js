import React from "react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import { cloneDeep } from "lodash"
import { mount } from "enzyme"
import { NewsArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { SocialEmbed } from "@artsy/reaction/dist/Components/Publishing/Sections/SocialEmbed"
import { SectionSocialEmbed } from "../index"
import { SocialEmbedControls } from "../controls"

describe("Section Social Embed", () => {
  let props

  beforeEach(() => {
    props = {
      article: cloneDeep(NewsArticle),
      section: NewsArticle.sections[2],
    }
  })

  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {},
      },
      edit: {
        article: props.article,
        section: NewsArticle.sections[2],
      },
    })

    return mount(
      <Provider store={store}>
        <SectionSocialEmbed {...props} />
      </Provider>
    )
  }

  it("Renders saved data", () => {
    const component = getWrapper(props)
    expect(component.find(SocialEmbed).exists()).toBe(true)
  })

  it("Renders placeholder if empty", () => {
    props.section = {}
    const component = getWrapper(props)

    expect(component.find(SocialEmbed).exists()).toBe(false)
    expect(component.text()).toBe("Add Twitter or Instagram URL above")
  })

  it("Renders controls if editing", () => {
    props.editing = true
    const component = getWrapper(props)

    expect(component.find(SocialEmbedControls).exists()).toBe(true)
  })
})
