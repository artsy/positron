import { mount } from "enzyme"
import React from "react"
import { EditableChild } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Helpers"
import { DragSource } from "../drag_source.jsx"

describe("DragSource", () => {
  let props

  beforeEach(() => {
    props = {
      activeSource: true,
      children: EditableChild("drag source"),
      isDraggable: true,
      index: 1,
      onDragEnd: jest.fn(),
      setDragSource: jest.fn(),
    }
  })

  it("renders an item and child", () => {
    const component = mount(<DragSource {...props} />)
    expect(component.text()).toMatch("Child drag source")
    expect(component.html()).toMatch('data-source="true"')
    expect(component.html()).toMatch('draggable="true"')
  })

  it("Changes data-active and draggable based on props", () => {
    props.isDraggable = false
    props.activeSource = false
    const component = mount(<DragSource {...props} />)
    expect(component.html()).toMatch('data-source="false"')
    expect(component.html()).toMatch('draggable="false"')
  })

  it("Calls props.setDragSource with index and position on dragStart", () => {
    const component = mount(<DragSource {...props} />)
    component.simulate("dragStart", { clientY: 200, currentTarget: component })
    expect(props.setDragSource.mock.calls[0][0]).toBe(props.index)
    expect(props.setDragSource.mock.calls[0][1]).toBe(0)
    expect(props.setDragSource.mock.calls[0][2]).toBe(200)
  })

  it("Does not call setDragSource unless isDraggable", () => {
    props.isDraggable = false

    const component = mount(<DragSource {...props} />)
    component.simulate("dragStart", { clientY: 200, currentTarget: component })
    expect(props.setDragSource.mock.calls.length).toBe(0)
  })

  it("Calls props.onDragEnd on dragEnd", () => {
    props.isDraggable = false

    const component = mount(<DragSource {...props} />)
    component.simulate("dragEnd")
    expect(props.onDragEnd.mock.calls.length).toBe(1)
  })
})
