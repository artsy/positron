import { mount } from "enzyme"
import React from "react"

import { DropDownItem } from "../drop_down_item.jsx"
import { DropDownList } from "../drop_down_list.jsx"

describe("DropDownList", () => {
  let props
  const children = [
    <div>Sample Content 1</div>,
    <div>Sample Content 2</div>,
    <div>Sample Content 3</div>,
  ]
  const sections = [
    { title: "Sample Title 1" },
    { title: "Sample Title 2" },
    { title: "Sample Title 3" },
  ]

  beforeEach(() => {
    props = {
      children,
      sections,
    }
  })

  it("Renders a title for each section", () => {
    const component = mount(<DropDownList {...props} />)
    expect(component.find(DropDownItem).length).toBe(3)
    expect(component.text()).toMatch("Sample Title 1")
    expect(component.text()).toMatch("Sample Title 2")
    expect(component.text()).toMatch("Sample Title 3")
  })

  it("Is closed by default", () => {
    const component = mount(<DropDownList {...props} />)
    expect(component.text()).not.toMatch("Sample Content")
    expect(component.html()).not.toMatch('data-active="true"')
  })

  it("Opens a section if props.activeSection", () => {
    props.activeSection = 1
    const component = mount(<DropDownList {...props} />)
    expect(component.html()).toMatch('data-active="true"')
    expect(component.text()).toMatch("Sample Content 2")
  })

  it("Opens sections if props.openMany and props.activeSections", () => {
    props.openMany = true
    props.activeSections = [0, 2]
    const component = mount(<DropDownList {...props} />)
    expect(component.html()).toMatch('data-active="true"')
    expect(component.text()).toMatch("Sample Content 1")
    expect(component.text()).toMatch("Sample Content 3")
    expect(component.text()).not.toMatch("Sample Content 2")
  })

  it("Calls setActiveSection when clicking a title", () => {
    const component = mount(<DropDownList {...props} />)
    component.instance().setActiveSection = jest.fn()
    component.update()
    const title = component.find(".DropDownItem__title").at(2)

    // FIXME TEST: Not sure why this has to be called twice
    title.simulate("click")
    title.simulate("click")
    expect(component.instance().setActiveSection.mock.calls[0][0]).toBe(2)
  })

  it("Calls setActiveSections when props.openMany and clicking a title", () => {
    props.openMany = true
    const component = mount(<DropDownList {...props} />)
    component.instance().setActiveSections = jest.fn()
    component.update()
    const title = component.find(".DropDownItem__title").at(2)

    // FIXME TEST: Not sure why this has to be called twice
    title.simulate("click")
    title.simulate("click")
    expect(component.instance().setActiveSections.mock.calls[0][0]).toBe(2)
  })
})
