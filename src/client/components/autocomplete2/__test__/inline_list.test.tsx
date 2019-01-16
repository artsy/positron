import { mount } from "enzyme"
import React from "react"
import { Autocomplete } from "../index"
import { AutocompleteInlineList } from "../inline_list"
require("typeahead.js")
import { IconRemove } from "@artsy/reaction/dist/Components/Publishing/Icon/IconRemove"

describe("AutocompleteInlineList", () => {
  let props

  beforeEach(() => {
    props = {
      items: ["Artists", "China", "Cats"],
      onSelect: jest.fn(),
      placeholder: "Search by title",
      url: "artsy.net",
    }
  })

  it("Renders an autocomplete input", () => {
    const component = mount(<AutocompleteInlineList {...props} />)
    expect(component.find(Autocomplete).length).toBe(1)
    expect(component.find(Autocomplete).props().placeholder).toMatch(
      props.placeholder
    )
    expect(component.find(Autocomplete).props().url).toMatch(props.url)
  })

  it("Renders list items", () => {
    const component = mount(<AutocompleteInlineList {...props} />)
    expect(component.text()).toMatch(props.items[0])
    expect(component.text()).toMatch(props.items[1])
    expect(component.text()).toMatch(props.items[1])
  })

  it("Can remove list items", () => {
    const component = mount(<AutocompleteInlineList {...props} />)
    const button = component.find(IconRemove).at(0)
    button.simulate("click")

    expect(props.onSelect.mock.calls[0][0].length).toBe(2)
    expect(props.onSelect.mock.calls[0][0][0]).not.toMatch("Artists")
  })
})
