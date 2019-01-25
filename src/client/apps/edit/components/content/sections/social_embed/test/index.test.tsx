import { NewsArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { SocialEmbed } from "@artsy/reaction/dist/Components/Publishing/Sections/SocialEmbed"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { SocialEmbedControls } from "../controls"
import { SectionSocialEmbed } from "../index"

describe("Section Social Embed", () => {
  let props
  let article

  beforeEach(() => {
    article = cloneDeep(NewsArticle)
    props = {
      article,
      section: article.sections[2],
    }
  })

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {},
      },
      edit: {
        article: passedProps.article,
        section: article.sections[2],
      },
    })

    return mount(
      <Provider store={store}>
        <SectionSocialEmbed {...props} />
      </Provider>
    )
  }

  it("Renders saved data", () => {
    const component = getWrapper()
    expect(component.find(SocialEmbed).exists()).toBe(true)
  })

  it("Renders placeholder if empty", () => {
    props.section = {}
    const component = getWrapper()

    expect(component.find(SocialEmbed).exists()).toBe(false)
    expect(component.text()).toBe("Add Twitter or Instagram URL above")
  })

  it("Renders controls if editing", () => {
    props.editing = true
    const component = getWrapper()

    expect(component.find(SocialEmbedControls).exists()).toBe(true)
  })
})
