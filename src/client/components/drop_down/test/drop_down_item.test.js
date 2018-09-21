import { mount } from "enzyme"
import React from "react"

import { DropDownItem } from "../drop_down_item.jsx"

describe("DropDownItem", () => {
  const child = <div key="3">Hello</div>

  const props = {
    index: 3,
    children: [child],
    title: "Sample Title",
    onClick: jest.fn(),
  }

  it("renders a closed title", () => {
    const component = mount(<DropDownItem {...props} />)
    expect(component.text()).toMatch("Sample Title")
    expect(component.text()).not.toMatch("Hello")
    expect(component.html()).not.toMatch('data-active="true"')
  })

  it("renders an open title if props.active is true", () => {
    props.active = true
    const component = mount(<DropDownItem {...props} />)
    expect(component.text()).toMatch("Sample Title")
    expect(component.text()).toMatch("Hello")
    expect(component.html()).toMatch('data-active="true"')
  })

  it("calls props.onClick when clicking the title", () => {
    props.active = false
    const component = mount(<DropDownItem {...props} />)
    const title = component.find(".DropDownItem__title").at(0)
    title.simulate("click")
    expect(props.onClick.mock.calls[0][0]).toBe(3)
  })
})
