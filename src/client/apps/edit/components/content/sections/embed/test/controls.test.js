import React from "react"
import configureStore from "redux-mock-store"
import { Provider } from "react-redux"
import { cloneDeep } from "lodash"
import { mount } from "enzyme"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { SectionControls } from "../../../section_controls"
import { EmbedControls } from "../controls"

describe("EmbedControls", () => {
  let props
  let section

  SectionControls.prototype.isScrollingOver = jest.fn()
  SectionControls.prototype.isScrolledPast = jest.fn()

  const getWrapper = props => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: StandardArticle,
        section: props.section,
        sectionIndex: props.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <section>
          <EmbedControls {...props} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    section = cloneDeep(StandardArticle.sections[10])

    props = {
      onChangeSectionAction: jest.fn(),
      removeSectionAction: jest.fn(),
      section,
      sectionIndex: 2,
    }
  })

  it("Renders the inputs", () => {
    const component = getWrapper(props)

    expect(component.find(SectionControls).length).toBe(1)
    expect(component.find("input").length).toBe(3)
  })

  it("Renders saved data", () => {
    const component = getWrapper(props)
    const inputs = component.find("input")

    expect(inputs.at(0).props().value).toBe(props.section.url)
    expect(inputs.at(1).props().value).toBe(props.section.height)
    expect(inputs.at(2).props().value).toBe(props.section.mobile_height)
  })

  it("Can change URL", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(0)
    const value = "new value"

    input.simulate("change", { target: { value } })
    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("url")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(value)
  })

  it("Can change height", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(1)
    const value = "500"

    input.simulate("change", { target: { value } })
    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("height")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(value)
  })

  it("Can change mobile height", () => {
    const component = getWrapper(props)
    const input = component.find("input").at(2)
    const value = "200"

    input.simulate("change", { target: { value } })
    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("mobile_height")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe(value)
  })

  it("Destroys section on unmount if URL is empty", () => {
    props.section = { type: "embed" }
    const component = getWrapper(props).find(EmbedControls)

    component.instance().componentWillUnmount()
    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.sectionIndex)
  })
})
