import { mount } from 'enzyme'
import Backbone from 'backbone'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../../models/article.coffee'
import { AdminVerticalsTags } from '../../components/verticals_tags.jsx'
import { AutocompleteInlineList } from '/client/components/autocomplete2/inline_list'
require('typeahead.js')

describe('AdminVerticalsTags', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.FeatureArticle),
      onChange: jest.fn()
    }

    Backbone.Collection.prototype.fetch = jest.fn((res) => {
      const verticals = new Backbone.Collection([
        {id: '123', name: 'Art'},
        {id: '456', name: 'News'},
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
      expect(component.find('.verticals button').length).toBe(3)
      expect(component.text()).toMatch(props.article.get('vertical').name)
    })

    it('Knows which vertical is active', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      expect(component.find('.verticals button[data-active=true]').at(0).text()).toMatch(
        component.props().article.get('vertical').name
      )
    })

    it('Can change the vertical on click', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const button = component.find('.verticals button').last()
      button.simulate('click')

      expect(props.onChange.mock.calls[0][0]).toBe('vertical')
      expect(props.onChange.mock.calls[0][1].name).toBe('News')
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

  describe('Topic Tags', () => {
    it('Renders inputs for topic tags', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const input = component.find(AutocompleteInlineList).first()

      expect(input.props().placeholder).toMatch('Start typing a topic tag...')
      expect(input.props().items).toBe(props.article.get('tags'))
    })

    it('Renders a list of saved topic tags', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const tagsList = component.find('.tags .Autocomplete__list-item')

      expect(tagsList.length).toBe(props.article.get('tags').length)
      expect(tagsList.at(0).text()).toMatch(props.article.get('tags')[0])
    })

    it('Can remove a saved topic tag', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const button = component.find('.tags .Autocomplete__list-item button').at(0)
      button.simulate('click')

      expect(props.onChange.mock.calls[0][0]).toBe('tags')
      expect(props.onChange.mock.calls[0][1].length).toBe(0)
    })
  })

  describe('Tracking Tags', () => {
    it('Renders inputs for tracking tags', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const input = component.find(AutocompleteInlineList).last()

      expect(input.props().placeholder).toMatch('Start typing a tracking tag...')
      expect(input.props().items).toBe(props.article.get('tracking_tags'))
    })

    it('Renders a list of saved tracking tags', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const tagsList = component.find('.tracking-tags .Autocomplete__list-item')

      expect(tagsList.length).toBe(props.article.get('tracking_tags').length)
      expect(tagsList.at(0).text()).toMatch(props.article.get('tracking_tags')[0])
    })

    it('Can remove a saved tracking tag', () => {
      const component = mount(
        <AdminVerticalsTags {...props} />
      )
      const button = component.find('.tracking-tags .Autocomplete__list-item button').at(0)
      button.simulate('click')

      expect(props.onChange.mock.calls[0][0]).toBe('tracking_tags')
      expect(props.onChange.mock.calls[0][1].length).toBe(0)
    })
  })
})
