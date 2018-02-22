import { mount } from 'enzyme'
import React from 'react'
import Article from '../../../../../../models/article.coffee'
import { AdminTags } from '../../components/tags.jsx'

describe('AdminTags', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article({
        tags: ['Cats', 'Kittens'],
        tracking_tags: ['Dogs', 'Puppies']
      }),
      onChange: jest.fn()
    }
  })

  describe('Topic Tags', () => {
    it('Renders inputs for topic tags', () => {
      const component = mount(
        <AdminTags {...props} />
      )
      const input = component.find('.tags input').first()

      expect(input.props().placeholder).toMatch('Start typing a topic tag...')
    })

    it('Renders a list of saved topic tags', () => {
      const component = mount(
        <AdminTags {...props} />
      )
      const input = component.find('.tags input').first()

      expect(input.props().defaultValue).toMatch(props.article.get('tags')[0])
      expect(input.props().defaultValue).toMatch(props.article.get('tags')[1])
    })

    it('Adds new tags on input', () => {
      const component = mount(
        <AdminTags {...props} />
      )
      const input = component.find('.tags input').first()
      input.simulate('change', {target: {value: 'New York, Photography'}})

      expect(props.onChange.mock.calls[0][0]).toBe('tags')
      expect(props.onChange.mock.calls[0][1][0]).toBe('New York')
    })
  })

  describe('Tracking Tags', () => {
    it('Renders inputs for tracking tags', () => {
      const component = mount(
        <AdminTags {...props} />
      )
      const input = component.find('.tracking-tags input').first()

      expect(input.props().placeholder).toMatch('Start typing a tracking tag...')
    })

    it('Renders a list of saved tracking tags', () => {
      const component = mount(
        <AdminTags {...props} />
      )
      const input = component.find('.tracking-tags input').first()

      expect(input.props().defaultValue).toMatch(props.article.get('tracking_tags')[0])
      expect(input.props().defaultValue).toMatch(props.article.get('tracking_tags')[1])
    })

    it('Adds new tracking tags on input', () => {
      const component = mount(
        <AdminTags {...props} />
      )
      const input = component.find('.tracking-tags input').first()
      input.simulate('change', {target: {value: 'New York, Photography'}})

      expect(props.onChange.mock.calls[0][0]).toBe('tracking_tags')
      expect(props.onChange.mock.calls[0][1][0]).toBe('New York')
    })
  })
})
