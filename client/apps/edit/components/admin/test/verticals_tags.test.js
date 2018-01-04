import { mount } from 'enzyme'
import Backbone from 'backbone'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { AdminVerticalsTags } from '../components/verticals_tags.jsx'

describe('AdminVerticalsTags', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      onChange: jest.fn()
    }

    Backbone.Collection.prototype.fetch = jest.fn((res) => {
      const verticals = new Backbone.Collection([
        {id: '123', name: 'Art'},
        {id: '456', name: 'Creativity'},
        props.article.get('vertical')
      ])
      return res.success(verticals)
    })
  })

  describe('Verticals', () => {
    it('Renders buttons for verticals', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      expect(component.find('button').length).toBe(3)
      expect(component.text()).toMatch(props.article.get('vertical').name)
    })

    it('Knows which vertical is active', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      expect(component.find('button[data-active=true]').at(0).text()).toMatch(
        component.props().article.get('vertical').name
      )
    })

    it('Can change the vertical on click', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const button = component.find('button').last()
      button.simulate('click')
      expect(props.onChange.mock.calls[0][0]).toBe('vertical')
      expect(props.onChange.mock.calls[0][1].name).toBe('Creativity')
    })

    it('Unsets vertical when clicking active vertical', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const button = component.find('button[data-active=true]').at(0)
      button.simulate('click')
      expect(props.onChange.mock.calls[0][0]).toBe('vertical')
      expect(props.onChange.mock.calls[0][1]).toBe(null)
    })
  })
})
