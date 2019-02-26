import { Input } from "@artsy/reaction/dist/Components/Input"
import {
  CharacterLimit,
  RemainingChars,
} from "client/components/character_limit"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import { mount } from "enzyme"
import React from "react"

describe("Character Limit", () => {
  const getWrapper = (passedProps = props) => {
    return mount(<CharacterLimit {...passedProps} />)
  }
  let props
  beforeEach(() => {
    props = {
      defaultValue: "Sample copy lorem ipsum.",
      html: false,
      label: "Title",
      limit: 50,
      placeholder: "Enter a title",
      onChange: jest.fn(),
    }
  })

  describe("Input", () => {
    it("renders an empty input", () => {
      delete props.defaultValue
      const component = getWrapper()

      expect(component.text()).toMatch("Title")
      expect(component.text()).toMatch("50 Characters")
      expect(component.find("input")).toHaveLength(1)
      expect(component.html()).toMatch('placeholder="Enter a title"')
    })

    it("renders an input with saved content", () => {
      const component = getWrapper()

      expect(component.text()).toMatch("26 Characters")
      expect(component.html()).toMatch('value="Sample copy lorem ipsum."')
      expect(component.find(RemainingChars).props().isOverLimit).toBeFalsy()
    })

    it("changes the color of remaining text if over limit", () => {
      props.limit = 23
      const component = getWrapper()

      expect(component.text()).toMatch("-1 Characters")
      expect(component.find(RemainingChars).props().isOverLimit).toBeTruthy()
    })

    it("calls onChange and resets the remaining characters on input", () => {
      props.limit = 23
      const component = getWrapper()
      const instance = component.instance() as CharacterLimit
      const input = component
        .find(Input)
        .at(0)
        .props()

      const event = ({
        currentTarget: {
          value: "Sample copy lorem ipsumz.",
        },
      } as unknown) as React.FormEvent<HTMLInputElement>
      input.onChange && input.onChange(event)

      expect(props.onChange).toBeCalledWith("Sample copy lorem ipsumz.")
      expect(instance.state.remainingChars).toBe(-2)
    })
  })

  describe("Textarea", () => {
    beforeEach(() => {
      props.limit = 25
      props.type = "textarea"
    })
    it("renders a textarea input", () => {
      const component = getWrapper()

      expect(component.find(PlainText)).toHaveLength(1)
      expect(component.text()).toMatch("Sample copy lorem ipsum.")
      expect(component.text()).toMatch("1 Characters")
    })

    it("renders a textarea input with html", () => {
      props.html = true
      props.defaultValue =
        '<p>Sample copy lorem ipsum. <a href="http://artsy.net">Link</a></p>'
      const component = getWrapper()

      expect(component.find(Paragraph)).toHaveLength(1)
      expect(component.text()).toMatch("-4 Characters")
      expect(component.text()).toMatch("Sample copy lorem ipsum.")
      expect(component.html()).toMatch('<a href="http://artsy.net/">')
    })
  })
})
