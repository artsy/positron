import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import Backbone from 'backbone'
import React from 'react'
import { FeatureArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { AdminVerticalsTags } from '../../components/verticals_tags.jsx'
import { AutocompleteInlineList } from '/client/components/autocomplete2/inline_list'
require('typeahead.js')

describe('AdminVerticalsTags', () => {
  let props

  const getWrapper = (props) => {
    return mount(
      <AdminVerticalsTags {...props} />
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(FeatureArticle),
      onChangeArticleAction: jest.fn()
    }

    Backbone.Collection.prototype.fetch = jest.fn((res) => {
      const verticals = new Backbone.Collection([
        { id: '123', name: 'Art' },
        { id: '456', name: 'News' },
        props.article.vertical
      ])
      return res.success(verticals)
    })
  })

  describe('Verticals', () => {
    it('Renders buttons for verticals', () => {
      const component = getWrapper(props)

      expect(component.find('.verticals button').length).toBe(3)
      expect(component.text()).toMatch(props.article.vertical.name)
    })

    it('Knows which vertical is active', () => {
      const component = getWrapper(props)

      expect(component.find('.verticals button[data-active=true]').at(0).text()).toMatch(
        component.props().article.vertical.name
      )
    })

    it('Can change the vertical on click', () => {
      const component = getWrapper(props)

      const button = component.find('.verticals button').last()
      button.simulate('click')

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('vertical')
      expect(props.onChangeArticleAction.mock.calls[0][1].name).toBe('News')
    })

    it('Unsets vertical when clicking active vertical', () => {
      const component = getWrapper(props)

      const button = component.find('button[data-active=true]').at(0)
      button.simulate('click')

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('vertical')
      expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(null)
    })

    it('#maybeSetupNews sets a news article vertical to News if no vertical present', () => {
      props.article.layout = 'news'
      props.article.vertical = null
      getWrapper(props)

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('vertical')
      expect(props.onChangeArticleAction.mock.calls[0][1].name).toBe('News')
    })
  })

  describe('Topic Tags', () => {
    it('Renders inputs for topic tags', () => {
      const component = getWrapper(props)
      const input = component.find(AutocompleteInlineList).first()

      expect(input.props().placeholder).toMatch('Start typing a topic tag...')
      expect(input.props().items).toBe(props.article.tags)
    })

    it('Renders a list of saved topic tags', () => {
      const component = getWrapper(props)
      const tagsList = component.find('.tags .Autocomplete__list-item')

      expect(tagsList.length).toBe(props.article.tags.length)
      expect(tagsList.at(0).text()).toMatch(props.article.tags[0])
    })

    it('Can remove a saved topic tag', () => {
      const component = getWrapper(props)
      const button = component.find('.tags .Autocomplete__list-item button').at(0)
      button.simulate('click')

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('tags')
      expect(props.onChangeArticleAction.mock.calls[0][1].length).toBe(0)
    })
  })

  describe('Tracking Tags', () => {
    it('Renders inputs for tracking tags', () => {
      const component = getWrapper(props)
      const input = component.find(AutocompleteInlineList).last()

      expect(input.props().placeholder).toMatch('Start typing a tracking tag...')
      expect(input.props().items).toBe(props.article.tracking_tags)
    })

    it('Renders a list of saved tracking tags', () => {
      const component = getWrapper(props)
      const tagsList = component.find('.tracking-tags .Autocomplete__list-item')

      expect(tagsList.length).toBe(props.article.tracking_tags.length)
      expect(tagsList.at(0).text()).toMatch(props.article.tracking_tags[0])
    })

    it('Can remove a saved tracking tag', () => {
      const component = getWrapper(props)
      const button = component.find('.tracking-tags .Autocomplete__list-item button').at(0)
      button.simulate('click')

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('tracking_tags')
      expect(props.onChangeArticleAction.mock.calls[0][1].length).toBe(0)
    })
  })
})
