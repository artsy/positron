import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { SectionType } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { mount } from "enzyme"
import { clone } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import sharify from "sharify"
import { SectionContainer } from "../../section_container"
import { SectionTool } from "../../section_tool"
import { SectionList } from "../index"
const DragContainer = require("client/components/drag_drop/index.coffee")

window.scrollTo = jest.fn()

jest.mock("sharify", () => ({ data: {} }))

describe("SectionList", () => {
  let props
  let article

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {},
      },
      edit: {
        article: passedProps.article,
        sectionIndex: passedProps.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <SectionList {...passedProps} />
      </Provider>
    )
  }

  beforeEach(() => {
    article = clone(StandardArticle)

    props = {
      article,
      logErrorAction: jest.fn(),
      onChangeArticleAction: jest.fn(),
      sectionIndex: null,
      setSectionAction: jest.fn(),
      section: clone(article.sections[0]),
    }
  })

  it("Renders the sections", () => {
    const component = getWrapper(props)
    expect(component.find(SectionContainer).length).toBe(
      props.article.sections.length
    )
  })

  it("Renders the section tools", () => {
    const component = getWrapper(props)
    expect(component.find(SectionTool).length).toBe(
      props.article.sections.length + 1
    )
  })

  it("Renders drag container more than 1 section", () => {
    const component = getWrapper(props)
    expect(component.find(DragContainer).exists()).toBe(true)
  })

  it("Does not render drag container if no sections", () => {
    props.article.sections = []
    const component = getWrapper(props)

    expect(component.find(DragContainer).exists()).toBe(false)
  })

  it("Does not render drag container if 1 section", () => {
    props.article.sections = [{ type: "embed" }]
    const component = getWrapper(props)

    expect(component.find(DragContainer).exists()).toBe(false)
    expect(component.find(SectionContainer).length).toBe(
      props.article.sections.length
    )
  })

  it("Listens for a new section and dispatches setSection with index", () => {
    const { sections } = props.article
    const newSection = { type: "embed" as SectionType }
    sections.push(newSection)
    const component = getWrapper(props).find(SectionList)
    const instance = component.instance() as SectionList
    instance.onNewSection(newSection)

    expect(props.setSectionAction.mock.calls[0][0]).toBe(sections.length - 1)
  })

  it("Shows an error if attempting to drag a news social_embed to first section", () => {
    props.article.layout = "news"
    const component = getWrapper(props).find(SectionList)
    const instance = component.instance() as SectionList
    instance.onDragEnd([{ type: "social_embed" }, { type: "text" }])

    expect(props.logErrorAction.mock.calls[0][0].message).toBe(
      "Embeds are not allowed in the first section."
    )
    expect(props.onChangeArticleAction).not.toBeCalled()
  })

  describe("section", () => {
    it("Uses props.sections for sectionContainer if not editing", () => {
      props.editSection = clone(article.sections[2])
      const component = getWrapper(props).find(SectionList)
      const section = component
        .find(SectionContainer)
        .at(0)
        .props().section

      expect(section).toEqual(article.sections[0])
    })

    it("Uses store.section as editSection for sectionContainer if editing and not text", () => {
      props.sectionIndex = 0
      props.editSection = clone(article.sections[2])
      const component = getWrapper(props).find(SectionList)
      const section = component
        .find(SectionContainer)
        .at(0)
        .props().section

      expect(section).toEqual(article.sections[2])
    })

    it("if edit2, passes props.sections to text sectionContainer", () => {
      sharify.data = { IS_EDIT_2: true }
      props.sectionIndex = 0
      props.editSection = clone(article.sections[2])
      const component = getWrapper(props).find(SectionList)
      const section = component
        .find(SectionContainer)
        .at(0)
        .props().section

      expect(section).toEqual(article.sections[0])
    })
  })
})
