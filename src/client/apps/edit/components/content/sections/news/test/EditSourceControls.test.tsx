import { mount } from "enzyme"
import React from "react"
import { EditSourceControls } from "../EditSourceControls"

describe("EditSourceControls", () => {
  let props

  beforeEach(() => {
    props = {
      onApply: jest.fn(),
    }
  })

  it("renders", () => {
    const component = mount(<EditSourceControls {...props} />)
    expect(component.exists()).toBe(true)
  })

  it("updates the state as input value changes", () => {
    const component = mount(<EditSourceControls {...props} />)
    const titleInput = component.find('input[name="title"]')
    titleInput.simulate("change", { target: { value: "Jacobin" } })

    const urlInput = component.find('input[name="url"]')
    urlInput.simulate("change", { target: { value: "jacobinmag.com" } })

    expect(component.state("title")).toBe("Jacobin")
    expect(component.state("url")).toBe("jacobinmag.com")
  })

  it("calls onApply when apply is clicked", () => {
    const component = mount(<EditSourceControls {...props} />)
    const button = component.find("button").at(0)
    button.simulate("click")

    expect(props.onApply.mock.calls[0]).toBeTruthy()
  })
})
