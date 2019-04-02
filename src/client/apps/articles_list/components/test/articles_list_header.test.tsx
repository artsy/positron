import { mount } from "enzyme"
import React from "react"
import { ArticlesListHeader } from "../articles_list_header"

describe("ArticlesListHeader", () => {
  let props

  const getWrapper = (passedProps = props) => {
    return mount(<ArticlesListHeader {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      channel: { name: "Artsy Editorial" },
      onChangeTabs: jest.fn(),
      isPublished: true,
    }
  })

  it("renders expected content", () => {
    const component = getWrapper()
    expect(component.text()).toBe("PublishedDraftsArtsy Editorial")
  })

  it("calls onChangeTabs on drafts tab click", () => {
    const component = getWrapper()
    component
      .find("TabButton")
      .at(0)
      .simulate("click")
    expect(props.onChangeTabs).toBeCalledWith(false)
  })

  it("calls onChangeTabs on published tab click", () => {
    props.isPublished = false
    const component = getWrapper()
    component
      .find("TabButton")
      .at(0)
      .simulate("click")
    expect(props.onChangeTabs).toBeCalledWith(true)
  })
})
