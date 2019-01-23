import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { Embed } from "@artsy/reaction/dist/Components/Publishing/Sections/Embed"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { EmbedControls } from "../controls"
import { SectionEmbed } from "../index"

describe("Section Embed", () => {
  let props
  let sections

  beforeEach(() => {
    sections = cloneDeep(StandardArticle.sections)

    props = {
      article: cloneDeep(StandardArticle),
      section: sections[10],
    }
  })

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {},
      },
      edit: {
        article: props.article,
        section: props.section,
      },
    })

    return mount(
      <Provider store={store}>
        <SectionEmbed {...passedProps} />
      </Provider>
    )
  }

  it("Renders saved data", () => {
    const component = getWrapper()
    expect(component.find(Embed).exists()).toBe(true)
  })

  it("Renders placeholder if empty", () => {
    props.section = {}
    const component = getWrapper()

    expect(component.find(Embed).exists()).toBe(false)
    expect(component.text()).toBe("Add URL above")
  })

  it("Renders controls if editing", () => {
    props.editing = true
    const component = getWrapper()

    expect(component.find(EmbedControls).exists()).toBe(true)
  })
})
