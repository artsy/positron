import React from "react"
import { SaveButton } from "../save_button.jsx"
import { mount } from "enzyme"

describe("Save Button", () => {
  const props = {
    onSave: jest.fn(),
    isSaved: true,
  }

  it("Renders as saved and black if isSaved is true", () => {
    const component = mount(<SaveButton {...props} />)
    expect(component.text()).toMatch("Saved")
    expect(component.html()).toMatch('style="color: black;"')
  })

  it("Renders as save and red if isSaved is false", () => {
    props.isSaved = false
    const component = mount(<SaveButton {...props} />)
    expect(component.text()).toMatch("Save")
    expect(component.html()).toMatch('style="color: rgb(247, 98, 90);"')
  })

  it("Calls props.onSave on click", () => {
    const component = mount(<SaveButton {...props} />)
    component
      .find("button")
      .first()
      .simulate("click")
    expect(props.onSave.mock.calls.length).toBe(1)
  })
})
