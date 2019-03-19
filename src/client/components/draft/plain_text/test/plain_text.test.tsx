import { Editor } from "draft-js"
import { mount } from "enzyme"
import React from "react"
import { PlainText } from "../plain_text"

jest.mock("lodash/debounce", () => jest.fn(e => e))

describe("PlainText", () => {
  let props
  window.scrollTo = jest.fn()

  beforeEach(() => {
    props = {
      name: "title",
      onChange: jest.fn(),
    }
  })

  const getWrapper = (passedProps = props) => {
    return mount(<PlainText {...passedProps} />)
  }

  it("renders a draft editor with placeholder", () => {
    const component = getWrapper()
    const editor = component.find(Editor).getElement()

    expect(editor.props.placeholder).toBe("Start Typing...")
  })

  it("sets up debounced change event", () => {
    const component = getWrapper().instance() as PlainText
    expect(component.debouncedOnContentChange).toBeInstanceOf(Function)
  })

  it("can accept a placeholder as props", () => {
    props.placeholder = "Title (required)"
    const component = getWrapper()

    expect(component.html()).toMatch("Title (required)")
  })

  it("can render saved content", () => {
    props.content =
      "Comparing the Costs of Being an Emerging Artist in New York, Los Angeles, and Berlin"
    const wrapper = getWrapper()

    expect(wrapper.html()).toMatch(
      "Comparing the Costs of Being an Emerging Artist in New York, Los Angeles, and Berlin"
    )
  })

  it("focuses on click", () => {
    const component = getWrapper()
    const instance = component.instance() as PlainText
    const spy = jest.spyOn(instance, "focus")
    component.update()
    // FIXME TEST: Not sure why this has to be called twice
    component.simulate("click")
    component.simulate("click")

    expect(spy).toHaveBeenCalled()
  })

  it("does not allow linebreaks", () => {
    const component = getWrapper()
    const instance = component.instance() as PlainText
    instance.handleReturn = jest.fn()
    component.update()
    instance.editor.focus()
    component
      .find(".public-DraftEditor-content")
      .simulate("keyDown", { keyCode: 13, which: 13 })

    expect(instance.handleReturn).toHaveBeenCalled()
  })

  it("#handleReturn returns handled", () => {
    const component = getWrapper()
    const instance = component.instance() as PlainText
    const e = { preventDefault: jest.fn() }
    const handleReturn = instance.handleReturn(e)

    expect(handleReturn).toBe("handled")
    expect(e.preventDefault).toBeCalled()
  })

  it("calls props.onChange when content changes", () => {
    props.content = "hello"
    const component = getWrapper()
    const instance = component.instance() as PlainText
    instance.editor.focus()

    component
      .find(".public-DraftEditor-content")
      .simulate("beforeInput", { data: "why " })

    expect(props.onChange).toHaveBeenCalledWith("why hello")
  })
})
