import { mount } from "enzyme"
import React from "react"
import { CharacterLimit } from "client/components/character_limit"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"

describe("Character Limit", () => {
  const getWrapper = props => {
    return mount(<CharacterLimit {...props} />)
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
      const component = getWrapper(props)

      expect(component.text()).toMatch("Title")
      expect(component.text()).toMatch("50 Characters")
      expect(component.html()).toMatch('<input class="bordered-input"')
      expect(component.html()).toMatch('placeholder="Enter a title"')
    })

    it("renders an input with saved content", () => {
      const component = getWrapper(props)

      expect(component.text()).toMatch("26 Characters")
      expect(component.html()).toMatch('style="color: rgb(153, 153, 153);"')
      expect(component.html()).toMatch('value="Sample copy lorem ipsum."')
    })

    it("changes the color of remaining text if over limit", () => {
      props.limit = 23
      const component = getWrapper(props)

      expect(component.text()).toMatch("-1 Characters")
      expect(component.html()).toMatch('style="color: rgb(247, 98, 90);"')
    })

    it("calls onChange and resets the remaining characters on input", () => {
      props.limit = 23
      const component = getWrapper(props)

      const input = component.find("input").at(0)
      input.simulate("change", {
        target: { value: "Sample copy lorem ipsumz." },
      })
      expect(props.onChange.mock.calls[0][0]).toMatch(
        "Sample copy lorem ipsumz."
      )
      expect(component.state().remainingChars).toBe(-2)
    })
  })

  describe("Textarea", () => {
    beforeEach(() => {
      props.limit = 25
      props.type = "textarea"
    })
    it("renders a textarea input", () => {
      const component = getWrapper(props)

      expect(component.find(PlainText)).toHaveLength(1)
      expect(component.text()).toMatch("Sample copy lorem ipsum.")
      expect(component.text()).toMatch("1 Characters")
    })

    it("renders a textarea input with html", () => {
      props.html = true
      props.defaultValue =
        '<p>Sample copy lorem ipsum. <a href="http://artsy.net">Link</a></p>'
      const component = getWrapper(props)

      expect(component.find(Paragraph)).toHaveLength(1)
      expect(component.text()).toMatch("-4 Characters")
      expect(component.text()).toMatch("Sample copy lorem ipsum.")
      expect(component.html()).toMatch('<a href="http://artsy.net/">')
    })
  })
})
