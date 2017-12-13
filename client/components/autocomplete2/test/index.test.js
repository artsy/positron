import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import { Autocomplete } from '../index.jsx'
require('typeahead.js')

describe('Autocomplete', () => {
  let props
  let results

  beforeEach(() => {
    props = {
      items: [],
      onSelect: jest.fn(),
      placeholder: 'Search by title',
      url: 'artsy.net'
    }

    results = [
      Fixtures.FeatureArticle,
      Fixtures.StandardArticle
    ]
  })

  it('Renders an input with placeholder', () => {
    const component = mount(
      <Autocomplete {...props} />
    )
    expect(component.find('input').length).toBe(1)
    expect(component.html()).toMatch(props.placeholder)
  })

  it('Sets up Bloodhound', () => {
    const component = mount(
      <Autocomplete {...props} />
    )
    expect(component.instance().engine.remote.url).toBe(props.url)
  })

  it('Searches with Bloodhound on input', () => {
    const component = mount(
      <Autocomplete {...props} />
    )
    component.instance().engine.get = jest.fn()
    const input = component.find('input').at(0)
    input.simulate('change', {target: {value: 'a title'}})
    expect(component.instance().engine.get.mock.calls[0][0]).toBe('a title')
  })

  it('OnSelect calls props.onSelect with selected id', () => {
    const component = mount(
      <Autocomplete {...props} />
    )
    component.instance().onSelect(results[0])
    expect(props.onSelect.mock.calls[0][0][0]).toBe(results[0]._id)
  })

  it('Disables input if props.disabled', () => {
    props.disabled = true
    const component = mount(
      <Autocomplete {...props} />
    )
    const input = component.find('input').at(0)
    expect(input.props().disabled).toBe(true)
  })

  xit('Uses a custom filter on results if provided', () => { })
  xit('Uses a custom format for results if provided', () => { })
  xit('Displays a list of results if present', () => { })
})
