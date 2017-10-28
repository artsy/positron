import Backbone from 'backbone'
import React from 'react'
import Controls from '../index.jsx'
import { SectionVideo } from '../../../video/index'
import { mount } from 'enzyme'
import {
  Fixtures,
  IconLayoutFullscreen,
  IconLayoutSplit,
  IconLayoutText
} from '@artsy/reaction-force/dist/Components/Publishing'

describe('Feature Header Controls', () => {
  describe('LayoutControls', () => {
    const props = {
      article: {},
      hero: {},
      onChange: jest.fn(),
      onClick: jest.fn()
    }

    it('renders change header controls', () => {
      const component = mount(
        <Controls {...props} />
      )
      expect(component.html()).toMatch('class="edit-header--controls-open"')
      expect(component.html()).toMatch('Change Header')
      expect(component.state().isLayoutOpen).toBe(false)
    })

    it('opens the menu on click', () => {
      const component = mount(
        <Controls {...props} />
      )
      component.find('.edit-header--controls-open').simulate('click')
      expect(component.state().isLayoutOpen).toBe(true)
      expect(component.find(IconLayoutFullscreen).length).toBe(1)
      expect(component.find(IconLayoutSplit).length).toBe(1)
      expect(component.find(IconLayoutText).length).toBe(1)
    })

    it('changes the layout click', () => {
      const component = mount(
        <Controls {...props} />
      )
      component.find('.edit-header--controls-open').simulate('click')
      component.find('a').first().simulate('click')
      expect(props.onChange.mock.calls[0][0]).toMatch('type')
      expect(props.onChange.mock.calls[0][1]).toMatch('text')
    })
  })

  describe('VideoControls', () => {
    let props

    beforeEach(() => {
      props = {
        article: new Backbone.Model(Fixtures.StandardArticle),
        hero: {
          type: 'basic',
          url: 'foo',
          cover_image_url: 'bar'
        },
        onChange: jest.fn(),
        onClick: jest.fn()
      }

      props.article.heroSection = new Backbone.Model(props.hero)
    })

    it('does not render controls if not a BasicHeader type', () => {
      props.hero.type = 'video'
      const component = mount(
        <Controls {...props} />
      )
      expect(component.html()).not.toMatch('class="edit-header--video')
    })

    it('renders embed video controls', () => {
      const component = mount(
        <Controls {...props} />
      )
      expect(component.html()).toMatch('class="edit-header--video')
      expect(component.html()).toMatch('Embed Video')
      expect(component.state().isVideoOpen).toBe(false)
    })

    it('opens the embed menu on click', () => {
      const component = mount(
        <Controls {...props} />
      )
      component.find('.edit-header--video-open').simulate('click')
      expect(component.state().isVideoOpen).toBe(true)
      expect(component.find(SectionVideo).exists()).toEqual(true)
    })

    describe('entering video / image url', () => {
      let component
      let input

      beforeEach(() => {
        component = mount(
          <Controls {...props} />
        )
        component.find('.edit-header--video-open').simulate('click')
        input = component.find('.bordered-input')
      })

      it('input should exist', () => {
        expect(input.exists()).toEqual(true)
      })

      it('does not update video url if invalid', () => {
        input.simulate('change', { target: { value: undefined } })
        expect(props.article.heroSection.get('url', props.hero.url))
        input.simulate('change', { target: { value: 'invalid url' } })
        expect(props.article.heroSection.get('url', props.hero.url))
      })

      it('updates video url if valid', () => {
        const validUrls = [
          'http://hello.com',
          'https://www.how.com',
          'http://are.you'
        ]
        validUrls.forEach(value => {
          input.node.value = value
          input.simulate('change', { target: {value} })
          expect(props.article.heroSection.get('url')).toEqual(value)
        })
      })
    })
  })
})
