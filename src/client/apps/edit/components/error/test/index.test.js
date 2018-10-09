import React from "react"
import { EditError } from "../index"
import { mount } from "enzyme"

describe("EditError", () => {
  let props

  const getWrapper = props => {
    return mount(<EditError {...props} />)
  }

  beforeEach(() => {
    props = {
      resetErrorAction: jest.fn(),
      error: {
        message: "Error Message",
      },
    }
  })

  it("Displays an error message", () => {
    const component = getWrapper(props)
    expect(component.text()).toMatch(props.error.message)
  })

  it("Resets the error state on click", () => {
    const component = getWrapper(props)
    component.simulate("click")
    expect(props.resetErrorAction.mock.calls.length).toBe(1)
  })
})
