import React from "react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import { cloneDeep } from "lodash"
import { mount } from "enzyme"
import { NewsArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { SectionControls } from "../../../section_controls"
import { SocialEmbedControls } from "../controls"

describe("SocialEmbedControls", () => {
  let props
  let section
  let article

  SectionControls.prototype.isScrollingOver = jest.fn()
  SectionControls.prototype.isScrolledPast = jest.fn()

  const getWrapper = props => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: props.article,
        section: props.section,
        sectionIndex: props.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <section>
          <SocialEmbedControls {...props} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    section = cloneDeep(NewsArticle.sections[2])
    article = cloneDeep(NewsArticle)

    props = {
      article,
      onChangeSectionAction: jest.fn(),
      removeSectionAction: jest.fn(),
      section,
      sectionIndex: 2,
    }
  })

  it("Renders the input", () => {
    const component = getWrapper(props)

    expect(component.find(SectionControls).length).toBe(1)
    expect(component.find("input").length).toBe(1)
  })

  it("Renders saved data", () => {
    const component = getWrapper(props)
    const inputs = component.find("input")

    expect(inputs.at(0).props().value).toBe(props.section.url)
  })

  it("Can change URL", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(0)
    const value = "new value"

    input.simulate("change", { target: { value } })
    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("url")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(value)
  })

  it("Destroys section on unmount if URL is empty", () => {
    props.section = { type: "embed" }
    const component = getWrapper(props).find(SocialEmbedControls)

    component.instance().componentWillUnmount()
    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.sectionIndex)
  })
})
