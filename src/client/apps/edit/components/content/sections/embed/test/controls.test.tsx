import { Input } from "@artsy/reaction/dist/Components/Input"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { SectionControls } from "client/apps/edit/components/content/section_controls"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { EmbedControls } from "../controls"

describe("EmbedControls", () => {
  let props
  let section

  SectionControls.prototype.isScrollingOver = jest.fn()
  SectionControls.prototype.isScrolledPast = jest.fn()

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: StandardArticle,
        section: passedProps.section,
        sectionIndex: passedProps.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <section>
          <EmbedControls {...passedProps} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    const sections = cloneDeep(StandardArticle.sections)
    section = sections[10]

    props = {
      onChangeSectionAction: jest.fn(),
      removeSectionAction: jest.fn(),
      section,
      sectionIndex: 2,
    }
  })

  it("Renders the inputs", () => {
    const component = getWrapper()

    expect(component.find(SectionControls).length).toBe(1)
    expect(component.find("input").length).toBe(3)
  })

  it("Renders saved data", () => {
    const component = getWrapper()
    const inputs = component.find("input")

    expect(inputs.at(0).props().value).toBe(props.section.url)
    expect(inputs.at(1).props().value).toBe(props.section.height)
    expect(inputs.at(2).props().value).toBe(props.section.mobile_height)
  })

  it("Can change URL", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(0)
      .props()
    const event = ({
      currentTarget: {
        value: "new value",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("url")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe("new value")
  })

  it("Can change height", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(1)
      .props()
    const event = ({
      currentTarget: {
        value: "500",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("height")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe("500")
  })

  it("Can change mobile height", () => {
    const component = getWrapper()
    const input = component
      .find(Input)
      .at(2)
      .props()
    const event = ({
      currentTarget: {
        value: "200",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("mobile_height")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe("200")
  })

  it("Destroys section on unmount if URL is empty", () => {
    props.section = { type: "embed" }
    const component = getWrapper()
      .find(EmbedControls)
      .instance() as EmbedControls

    component.componentWillUnmount()
    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.sectionIndex)
  })
})
