import { FeatureArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import React from "react"
import {
  ControlsContainer,
  LayoutButton,
  LayoutControls,
  OpenControlsContainer,
} from "../LayoutControls"

describe("LayoutControls", () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(<LayoutControls {...passedProps} />)
  }

  beforeEach(() => {
    props = {
      isOpen: false,
      hero: FeatureArticle.hero_section,
      onChange: jest.fn(),
      onClick: jest.fn(),
    }
  })

  it("Renders as expected when closed", () => {
    const component = getWrapper()

    expect(component.text()).toMatch("Change Header +")
    expect(component.find(ControlsContainer).length).toBe(0)
  })

  it("Renders as expected when open", () => {
    props.isOpen = true
    const component = getWrapper()

    expect(component.find(ControlsContainer).length).toBe(1)
    expect(component.find(LayoutButton).length).toBe(4)
  })

  it("Calls props.onClick on OpenControlsContainer click", () => {
    const component = getWrapper()
    component
      .find(OpenControlsContainer)
      .at(0)
      .simulate("click")

    expect(props.onClick).toBeCalled()
  })

  describe("LayoutButton", () => {
    beforeEach(() => {
      props.isOpen = true
    })

    it("Can change to text layout", () => {
      const component = getWrapper()
      component
        .find(LayoutButton)
        .at(0)
        .simulate("click")

      expect(props.onChange).toBeCalledWith("type", "text")
    })

    it("Can change to fullscreen layout", () => {
      const component = getWrapper()
      component
        .find(LayoutButton)
        .at(1)
        .simulate("click")

      expect(props.onChange).toBeCalledWith("type", "fullscreen")
    })

    it("Can change to split layout", () => {
      const component = getWrapper()
      component
        .find(LayoutButton)
        .at(2)
        .simulate("click")

      expect(props.onChange).toBeCalledWith("type", "split")
    })

    it("Can change to basic layout", () => {
      const component = getWrapper()
      component
        .find(LayoutButton)
        .at(3)
        .simulate("click")

      expect(props.onChange).toBeCalledWith("type", "basic")
    })
  })
})
