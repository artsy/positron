import React from "react"
import { ErrorBoundary } from "../error_boundary"
import { mount } from "enzyme"

describe("EditError", () => {
  const getWrapper = () => {
    return mount(
      <ErrorBoundary>
        <div>A child component</div>
      </ErrorBoundary>
    )
  }

  it("Displays children", () => {
    const component = getWrapper()
    expect(component.text()).toMatch("A child component")
  })

  it("Logs an error on #ComponentDidCatch", () => {
    console.error = jest.fn()
    const error = "An Error"
    const errorInfo = "The error info"
    const component = getWrapper()

    component.instance().componentDidCatch(error, errorInfo)
    expect(console.error.mock.calls[0][0]).toBe(error)
  })
})
