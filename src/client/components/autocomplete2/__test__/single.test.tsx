import { mount } from "enzyme"
import React from "react"
import { Autocomplete } from "../index"
import { AutocompleteSingle } from "../single"
require("typeahead.js")

describe("AutocompleteSingle", () => {
  let props
  let items
  let fetchItem

  const getWrapper = (passedProps = props) => {
    return mount(<AutocompleteSingle {...passedProps} />)
  }

  beforeEach(() => {
    items = [{ _id: "123", title: "First Article" }]

    fetchItem = jest.fn((_item, cb) => {
      return cb(items)
    })

    props = {
      idToFetch: "1234",
      fetchItem,
      onSelect: jest.fn(),
      placeholder: "Search by title",
      url: "artsy.net",
      type: "single",
    }
  })

  it("Renders autocomplete input if there is no item", () => {
    props.idToFetch = null
    props.fetchItem = jest.fn((_item, _cb) => {
      return null
    })
    const component = getWrapper(props)

    expect(component.find(Autocomplete).length).toBe(1)
    expect(component.find(Autocomplete).props().placeholder).toMatch(
      props.placeholder
    )
    expect(component.find(Autocomplete).props().url).toMatch(props.url)
  })

  it("Renders item if idToFetch", () => {
    const component = getWrapper()

    expect(component.text()).toMatch(items[0].title)
    expect(component.find(Autocomplete).length).toBe(0)
  })

  it("Fetches idToFetch and renders item", () => {
    const component = getWrapper()

    expect(props.fetchItem.mock.calls.length).toBe(1)
    expect(component.text()).toMatch(items[0].title)
  })

  it("Can remove list items", () => {
    const component = getWrapper()
    const button = component.find("button").at(0)
    button.simulate("click")

    expect(props.onSelect.mock.calls[0][0]).toBeNull()
    expect(props.onSelect.mock.calls.length).toBe(1)
  })

  it("Calls fetchItem if props have changed", () => {
    props.item = ["123"]
    const component = getWrapper(props).instance() as AutocompleteSingle
    component.componentDidUpdate({ item: items[0] })

    expect(props.fetchItem.mock.calls.length).toBe(2)
  })
})
