import { mount } from 'enzyme'
import React from 'react'
import { AutocompleteList } from '../list'
import { Autocomplete } from '../index'
require('typeahead.js')

describe('AutocompleteList', () => {
  let props
  let items
  let fetchItems

  const getWrapper = (props) => {
    return mount(
      <AutocompleteList {...props} />
    )
  }

  beforeEach(() => {
    items = [
      { _id: '123', title: 'First Article' },
      { _id: '234', title: 'Second Article' },
      { _id: '345', title: 'Third Article' }
    ]

    fetchItems = jest.fn((fetchedItems, cb) => {
      const newItems = items
      return cb(newItems)
    })

    props = {
      items: ['123', '234', '345'],
      fetchItems,
      onSelect: jest.fn(),
      placeholder: 'Search by title',
      url: 'artsy.net'
    }
  })

  it('Renders an autocomplete input', () => {
    const component = getWrapper(props)

    expect(component.find(Autocomplete).length).toBe(1)
    expect(component.find(Autocomplete).props().placeholder).toMatch(props.placeholder)
    expect(component.find(Autocomplete).props().url).toMatch(props.url)
  })

  it('Fetches and renders list items', () => {
    const component = getWrapper(props)

    expect(props.fetchItems.mock.calls.length).toBe(1)
    expect(component.text()).toMatch(items[0].title)
    expect(component.text()).toMatch(items[1].title)
    expect(component.text()).toMatch(items[2].title)
  })

  it('Can remove list items with _id', () => {
    const component = getWrapper(props)
    const button = component.find('button').at(0)
    button.simulate('click')

    expect(props.onSelect.mock.calls[0][0].length).toBe(2)
    expect(props.onSelect.mock.calls[0][0][0]).not.toMatch('123')
  })

  it('Can remove list items with id', () => {
    items = [
      { id: '123', title: 'First Article' },
      { id: '234', title: 'Second Article' },
      { id: '345', title: 'Third Article' }
    ]
    const component = getWrapper(props)
    const button = component.find('button').at(0)
    button.simulate('click')

    expect(props.onSelect.mock.calls[0][0].length).toBe(2)
    expect(props.onSelect.mock.calls[0][0][0]).not.toMatch('123')
  })

  it('Calls fetchItems if props have changed', () => {
    props.items = ['123']
    const component = getWrapper(props)
    component.instance().componentDidUpdate({ items })

    expect(props.fetchItems.mock.calls.length).toBe(2)
  })
})
