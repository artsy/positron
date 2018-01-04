import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from 'client/models/article.coffee'
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

  it('OnSelect calls props.onSelect with selected id', async () => {
    const component = mount(
      <Autocomplete {...props} />
    )
    await component.instance().onSelect(results[0])
    expect(props.onSelect.mock.calls[0][0][0]).toBe(results[0].id)
  })

  it('Returns a custom resObject on select if provided', async () => {
    const resObject = (item) => {
      return new Article(item)
    }

    props.resObject = resObject
    const component = mount(
      <Autocomplete {...props} />
    )
    await component.instance().onSelect(results[0])
    expect(props.onSelect.mock.calls[0][0][0].get('id')).toBe(results[0].id)
  })

  it('Disables input if props.disabled', () => {
    props.disabled = true
    const component = mount(
      <Autocomplete {...props} />
    )
    const input = component.find('input').at(0)
    expect(input.props().disabled).toBe(true)
  })

  it('Uses a custom filter on results if provided', () => {
    const filter = (items) => {
      return items.results.map((item) => {
        return {
          _id: item.id,
          title: item.title,
          slug: item.slug
        }
      })
    }

    props.filter = filter
    const component = mount(
      <Autocomplete {...props} />
    )
    expect(component.instance().engine.remote.filter).toBe(props.filter)
    expect(component.instance().engine.remote.filter({ results })[0].slug).toBe(results[0].slug)
  })

  it('Displays a list of results if present', () => {
    const component = mount(
      <Autocomplete {...props} />
    )
    component.instance().isFocused = jest.fn().mockReturnValue(true)
    component.setState({ results })
    expect(component.find('.Autocomplete__item').length).toBe(results.length)
    expect(component.html()).toMatch(results[0].title)
  })

  it('Displays "No Results" if focused and no results', () => {
    const component = mount(
      <Autocomplete {...props} />
    )
    component.instance().isFocused = jest.fn().mockReturnValue(true)
    component.setState({results: []})
    expect(component.find('.Autocomplete__item').length).toBe(1)
    expect(component.html()).toMatch('No results')
  })

  it('Uses a custom format for results if provided', () => {
    const formatResult = (item) => {
      return <div>Child: {item.title}</div>
    }
    props.formatResult = formatResult
    const component = mount(
      <Autocomplete {...props} />
    )
    component.instance().isFocused = jest.fn().mockReturnValue(true)
    component.setState({ results })
    expect(component.text()).toMatch(`Child: ${results[0].title}`)
  })
})
