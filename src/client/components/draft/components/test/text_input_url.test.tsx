import { Button } from "@artsy/palette"
import { mount } from "enzyme"
import React from "react"
import { RemoveButton } from "../../../remove_button"
import { BackgroundOverlay } from "../background_overlay"
import { TextInputUrl } from "../text_input_url"

jest.mock("draft-js", () => ({
  getVisibleSelectionRect: jest.fn().mockReturnValue({
    bottom: 170,
    height: 25,
    left: 425,
    right: 525,
    top: 145,
    width: 95,
  }),
}))

describe("TextInputUrl", () => {
  const getWrapper = passedProps => {
    return mount(<TextInputUrl {...passedProps} />)
  }
  const getClientRects = jest.fn().mockReturnValue([
    {
      bottom: 170,
      height: 25,
      left: 425,
      right: 525,
      top: 145,
      width: 95,
    },
  ])
  const getRangeAt = jest.fn().mockReturnValue({ getClientRects })
  window.getSelection = jest.fn().mockReturnValue({
    isCollapsed: false,
    getRangeAt,
  })

  let props
  beforeEach(() => {
    props = {
      editorPosition: {
        top: 120,
        left: 200,
      },
      isFollowLink: false,
      onClickOff: jest.fn(),
      onConfirmLink: jest.fn(),
      onRemoveLink: jest.fn(),
      urlValue: null,
    }
  })

  it("Renders input and appy button", () => {
    const component = getWrapper(props)
    const input = component.find("input").getElement()
    const button = component.find(Button).getElement()

    expect(input.props.placeholder).toBe("Paste or type a link")
    expect(input.props.value).toBe("")
    expect(button.props.children).toBe("Apply")
  })

  it("Can render an existing link", () => {
    props.urlValue = "http://artsy.net"
    const component = getWrapper(props)
    const input = component.find("input").getElement()

    expect(input.props.value).toBe("http://artsy.net")
  })

  it("Renders remove button if has url", () => {
    props.urlValue = "http://artsy.net"
    const component = getWrapper(props)

    expect(component.find(RemoveButton).exists()).toBe(true)
  })

  it("Can input a url", () => {
    const component = getWrapper(props)
    const input = component.find("input")
    const value = "http://link.com"

    input.simulate("change", { target: { value } })
    expect(component.state().url).toBe(value)
  })

  it("Can save a link on button click", () => {
    const component = getWrapper(props)
    const url = "http://link.com"
    const button = component.find(Button)
    component.setState({ url })
    button.simulate("click")

    expect(props.onConfirmLink).toBeCalledWith(url, false)
  })

  it("Can save a link with plugins", () => {
    props.isFollowLink = true
    const component = getWrapper(props)
    const url = "http://link.com"
    const button = component.find(Button)
    component.setState({ url })
    button.simulate("click")

    expect(props.onConfirmLink).toBeCalledWith(url, true)
  })

  it("Does not save empty links", () => {
    const component = getWrapper(props)
    const url = ""
    const button = component.find(Button)
    component.setState({ url })
    button.simulate("click")

    expect(props.onConfirmLink).not.toBeCalled()
    expect(props.onRemoveLink).toBeCalled()
  })

  it("Can remove a link", () => {
    props.urlValue = "http://artsy.net"
    const component = getWrapper(props)
    component.find(RemoveButton).simulate("mouseDown")

    expect(props.onRemoveLink.mock.calls.length).toBe(1)
  })

  it("Calls #onClickOff on background click", () => {
    const component = getWrapper(props)
    component.find(BackgroundOverlay).simulate("click")

    expect(props.onClickOff).toBeCalled()
  })

  it("#stickyControlsBox calculates position based on selection and editorPosition", () => {
    const component = getWrapper(props).instance() as TextInputUrl
    const stickyControlsBox = component.stickyControlsBox()

    expect(stickyControlsBox.top).toBe(42)
    expect(stickyControlsBox.left).toBe(97.5)
  })

  describe("#onKeyDown", () => {
    it("Calls #onConfirmLink on enter", () => {
      props.urlValue = "http://artsy.net"
      const e = {
        key: "Enter",
        preventDefault: jest.fn(),
        target: { value: "http://artsy.net/articles" },
      }
      const component = getWrapper(props).instance() as TextInputUrl
      component.onKeyDown(e)

      expect(e.preventDefault).toBeCalled()
      expect(props.onConfirmLink).toBeCalledWith(
        "http://artsy.net/articles",
        false
      )
    })

    it("Calls #onClickOff on esc", () => {
      const e = { key: "Escape", preventDefault: jest.fn() }
      const component = getWrapper(props).instance() as TextInputUrl
      component.onKeyDown(e)

      expect(props.onClickOff).toBeCalled()
    })

    it("Calls #onExitInput on tab", () => {
      const e = { key: "Tab", preventDefault: jest.fn() }
      const component = getWrapper(props)
      const instance = component.instance() as TextInputUrl
      instance.onExitInput = jest.fn()
      component.update()
      instance.onKeyDown(e)

      expect(instance.onExitInput).toBeCalledWith(e)
    })
  })

  describe("#onExitInput", () => {
    it("Calls #onConfirmLink if url is present", () => {
      props.urlValue = "http://artsy.net"
      const e = {
        key: "Tab",
        preventDefault: jest.fn(),
        target: { value: "http://artsy.net/articles" },
      }
      const component = getWrapper(props).instance() as TextInputUrl
      component.onExitInput(e)

      expect(props.onConfirmLink.mock.calls[0][0]).toBe(
        "http://artsy.net/articles"
      )
    })

    it("Calls #removeLink if url has been deleted", () => {
      props.urlValue = "http://artsy.net"
      const e = {
        key: "Tab",
        preventDefault: jest.fn(),
        target: { value: "" },
      }
      const component = getWrapper(props).instance() as TextInputUrl
      component.onExitInput(e)

      expect(props.onRemoveLink).toBeCalled()
    })

    it("Calls #onClickOff if url was not edited", () => {
      const e = {
        key: "Tab",
        preventDefault: jest.fn(),
        target: { value: "" },
      }
      const component = getWrapper(props).instance() as TextInputUrl
      component.onExitInput(e)

      expect(props.onClickOff).toBeCalled()
    })
  })
})
