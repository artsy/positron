import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { CharacterLimit } from '../../../../../components/character_limit'
import { DisplaySearch } from '../components/search'

describe('DisplaySearch', () => {
  let props
  let search_description
  let search_title

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      onChange: jest.fn()
    }
    search_title = 'Virtual Reality Is the Most Powerful Artistic Medium of Our Time'
    search_description = 'To create a total experience that will create a feeling that is qualitatively new'
    props.article.set({ search_description, search_title })
  })

  it('Renders all form fields', () => {
    const component = mount(
      <DisplaySearch {...props} />
    )
    expect(component.find(CharacterLimit).length).toBe(2)
  })

  it('Can display saved data', () => {
    const component = mount(
      <DisplaySearch {...props} />
    )
    expect(component.html()).toMatch(props.article.get('search_title'))
    expect(component.html()).toMatch(props.article.get('search_description'))
  })

  it('Can change the thumbnail title', () => {
    const component = mount(
      <DisplaySearch {...props} />
    )
    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('New title')

    expect(props.onChange.mock.calls[0][0]).toBe('search_title')
    expect(props.onChange.mock.calls[0][1]).toBe('New title')
  })

  it('Can change the description', () => {
    const component = mount(
      <DisplaySearch {...props} />
    )
    const input = component.find(CharacterLimit).at(1).getElement()
    input.props.onChange('New description')

    expect(props.onChange.mock.calls[0][0]).toBe('search_description')
    expect(props.onChange.mock.calls[0][1]).toBe('New description')
  })
})
