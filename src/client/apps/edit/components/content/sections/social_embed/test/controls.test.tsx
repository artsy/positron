import { Input } from "@artsy/reaction/dist/Components/Input"
import { NewsArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import React from "react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { SectionControls } from "../../../section_controls"
import { SocialEmbedControls } from "../controls"

describe("SocialEmbedControls", () => {
  let props
  let sections
  let section
  let article

  SectionControls.prototype.isScrollingOver = jest.fn()
  SectionControls.prototype.isScrolledPast = jest.fn()

  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article: passedProps.article,
        section: passedProps.section,
        sectionIndex: passedProps.sectionIndex,
      },
    })

    return mount(
      <Provider store={store}>
        <section>
          <SocialEmbedControls {...passedProps} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    sections = cloneDeep(NewsArticle.sections)
    section = sections[2]
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
    expect(component.find(Input).length).toBe(1)
  })

  it("Renders saved data", () => {
    const component = getWrapper(props)
    const inputs = component.find(Input)

    expect(inputs.at(0).props().value).toBe(props.section.url)
  })

  it("Can change URL", () => {
    const component = getWrapper(props)
    const input = component
      .find(Input)
      .at(0)
      .instance() as Input
    const event = ({
      currentTarget: {
        value: "New value",
      },
    } as unknown) as React.FormEvent<HTMLInputElement>
    input.onChange(event)

    expect(props.onChangeSectionAction.mock.calls[0][0]).toBe("url")
    expect(props.onChangeSectionAction.mock.calls[0][1]).toBe("New value")
  })

  it("Destroys section on unmount if URL is empty", () => {
    props.section = { type: "embed" }
    const component = getWrapper(props)
      .find(SocialEmbedControls)
      .instance() as SocialEmbedControls

    component.componentWillUnmount()
    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.sectionIndex)
  })
})
