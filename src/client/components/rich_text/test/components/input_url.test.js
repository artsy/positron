import React from "react"
import { mount } from "enzyme"
import { RemoveButton } from "client/components/remove_button"
import {
  TextInputUrl,
  Button,
  BackgroundOverlay,
} from "client/components/rich_text/components/input_url"

describe("TextInputUrl", () => {
  let props

  const getWrapper = props => {
    return mount(<TextInputUrl {...props} />)
  }

  beforeEach(() => {
    props = {
      confirmLink: jest.fn(),
      onClickOff: jest.fn(),
      pluginType: undefined,
      removeLink: jest.fn(),
      selectionTarget: {},
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
    button.simulate("mouseDown")

    expect(props.confirmLink.mock.calls[0][0]).toBe(url)
  })

  it("Can save a link with plugins", () => {
    props.pluginType = "artist"
    const component = getWrapper(props)
    const url = "http://link.com"
    const button = component.find(Button)
    component.setState({ url })
    button.simulate("mouseDown")

    expect(props.confirmLink.mock.calls[0][0]).toBe(url)
    expect(props.confirmLink.mock.calls[0][1]).toBe(props.pluginType)
  })

  it("Does not save empty links", () => {
    const component = getWrapper(props)
    const url = ""
    const button = component.find(Button)
    component.setState({ url })
    button.simulate("mouseDown")

    expect(props.confirmLink.mock.calls.length).toBe(0)
    expect(props.removeLink.mock.calls.length).toBe(1)
  })

  it("Can remove a link", () => {
    props.urlValue = "http://artsy.net"
    const component = getWrapper(props)
    component.find(RemoveButton).simulate("mouseDown")

    expect(props.removeLink.mock.calls.length).toBe(1)
  })

  it("Calls #onClickOff on background click", () => {
    const component = getWrapper(props)
    component.find(BackgroundOverlay).simulate("click")

    expect(props.onClickOff).toBeCalled()
  })

  describe("#onKeyDown", () => {
    it("Calls #confirmLink on enter", () => {
      props.urlValue = "http://artsy.net"
      const e = {
        key: "Enter",
        preventDefault: jest.fn(),
        target: { value: "http://artsy.net/articles" },
      }
      const component = getWrapper(props)
      component.instance().onKeyDown(e)

      expect(e.preventDefault).toBeCalled()
      expect(props.confirmLink.mock.calls[0][0]).toBe(
        "http://artsy.net/articles"
      )
    })

    it("Calls #onClickOff on esc", () => {
      const e = { key: "Escape", preventDefault: jest.fn() }
      const component = getWrapper(props)
      component.instance().onKeyDown(e)

      expect(props.onClickOff).toBeCalled()
    })

    it("Calls #onExitInput on tab", () => {
      const e = { key: "Tab", preventDefault: jest.fn() }
      const component = getWrapper(props)
      component.instance().onExitInput = jest.fn()
      component.update()
      component.instance().onKeyDown(e)

      expect(component.instance().onExitInput).toBeCalledWith(e)
    })
  })

  describe("#onExitInput", () => {
    it("Calls #confirmLink if url is present", () => {
      props.urlValue = "http://artsy.net"
      const e = {
        key: "Tab",
        preventDefault: jest.fn(),
        target: { value: "http://artsy.net/articles" },
      }
      const component = getWrapper(props)
      component.instance().onExitInput(e)

      expect(props.confirmLink.mock.calls[0][0]).toBe(
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
      const component = getWrapper(props)
      component.instance().onExitInput(e)

      expect(props.removeLink).toBeCalled()
    })

    it("Calls #onClickOff if url was not edited", () => {
      const e = {
        key: "Tab",
        preventDefault: jest.fn(),
        target: { value: "" },
      }
      const component = getWrapper(props)
      component.instance().onExitInput(e)

      expect(props.onClickOff).toBeCalled()
    })
  })
})
