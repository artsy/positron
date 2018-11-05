import React from "react"
import { mount } from "enzyme"
import { Editor } from "draft-js"
import { PlainText } from "../plain_text"

describe("PlainText", () => {
  const props = {
    name: "title",
    onChange: jest.fn(),
  }
  window.scrollTo = jest.fn()

  const getWrapper = props => {
    return mount(<PlainText {...props} />)
  }
  it("renders a draft editor with placeholder", () => {
    const wrapper = getWrapper(props)
    const editor = wrapper.find(Editor).getElement()

    expect(editor.props.placeholder).toBe("Start Typing...")
  })

  it("can accept a placeholder as props", () => {
    props.placeholder = "Title (required)"
    const wrapper = getWrapper(props)

    expect(wrapper.html()).toMatch("Title (required)")
  })

  it("can render saved content", () => {
    props.content =
      "Comparing the Costs of Being an Emerging Artist in New York, Los Angeles, and Berlin"
    const wrapper = getWrapper(props)

    expect(wrapper.html()).toMatch(
      "Comparing the Costs of Being an Emerging Artist in New York, Los Angeles, and Berlin"
    )
  })

  it("focuses on click", () => {
    const wrapper = getWrapper(props)
    const spy = jest.spyOn(wrapper.instance(), "focus")
    wrapper.update()
    // FIXME TEST: Not sure why this has to be called twice
    wrapper.simulate("click")
    wrapper.simulate("click")

    expect(spy).toHaveBeenCalled()
  })

  it("does not allow linebreaks", () => {
    const wrapper = getWrapper(props)
    wrapper.instance().handleReturn = jest.fn()
    wrapper.update()
    wrapper.instance().editor.focus()
    wrapper
      .find(".public-DraftEditor-content")
      .simulate("keyDown", { keyCode: 13, which: 13 })
    expect(wrapper.instance().handleReturn).toHaveBeenCalled()
  })

  it("calls props.onChange when content changes", () => {
    const wrapper = getWrapper(props)
    wrapper.instance().editor.focus()
    wrapper
      .find(".public-DraftEditor-content")
      .simulate("keyUp", { keyCode: 70, which: 70 })
    setTimeout(
      () => expect(wrapper.instance().props().onChange).toHaveBeenCalled(),
      250
    )
  })
})
