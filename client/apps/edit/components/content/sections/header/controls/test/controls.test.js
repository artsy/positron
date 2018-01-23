import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import Article from '../../../../../../../../models/article'
import LayoutControls from '../LayoutControls'
import ModalCover from '../ModalCover'
import VideoControls from '../VideoControls'
import { HeaderControls } from '../index'
import { Controls } from '../../../video/controls'
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
      article: new Article(),
      hero: {},
      onChange: jest.fn(),
      onClick: jest.fn(),
      onProgress: jest.fn()
    }

    it('renders change header controls', () => {
      const component = mount(
        <HeaderControls {...props} />
      )
      expect(component.html()).toMatch('class="edit-header--controls-open"')
      expect(component.html()).toMatch('Change Header')
      expect(component.state().isLayoutOpen).toBe(false)
    })

    it('opens the menu on click', () => {
      const component = mount(
        <HeaderControls {...props} />
      )
      component.find('.edit-header--controls-open').simulate('click')
      expect(component.state().isLayoutOpen).toBe(true)
      expect(component.find(LayoutControls).exists()).toEqual(true)
      expect(component.find(ModalCover).exists()).toEqual(true)
      expect(component.find(IconLayoutFullscreen).exists()).toBe(true)
      expect(component.find(IconLayoutSplit).exists()).toBe(true)
      expect(component.find(IconLayoutText).exists()).toBe(true)
    })

    it('changes the layout click', () => {
      const component = mount(
        <HeaderControls {...props} />
      )
      component.find('.edit-header--controls-open').simulate('click')
      component.find('a').first().simulate('click')
      expect(props.onChange.mock.calls[0][0]).toMatch('type')
      expect(props.onChange.mock.calls[0][1]).toMatch('text')
    })
  })

  describe('VideoControls', () => {
    let props

    const getWrapper = (props) => {
      const mockStore = configureStore([])
      const store = mockStore({
        app: { channel: {} },
        edit: { article: {} }
      })

      return mount(
        <Provider store={store}>
          <HeaderControls {...props} />
        </Provider>
      )
    }

    beforeEach(() => {
      props = {
        article: new Article(Fixtures.StandardArticle),
        hero: {
          type: 'basic',
          url: 'foo',
          cover_image_url: 'bar'
        },
        onChange: jest.fn(),
        onClick: jest.fn(),
        onProgress: jest.fn()
      }
    })

    it('does not render controls if not a BasicHeader type', () => {
      props.hero.type = 'video'
      const component = getWrapper(props)

      expect(component.html()).not.toMatch('class="edit-header--video')
    })

    it('renders embed video controls', () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch('class="edit-header--video')
      expect(component.html()).toMatch('Embed Video')
      expect(component.find(VideoControls).getElement().props.isOpen).toBe(false)
    })

    it('opens the embed menu on click', () => {
      const component = getWrapper(props)
      component.find('.edit-header--video-open').simulate('click')

      expect(component.find(VideoControls).getElement().props.isOpen).toBe(true)
      expect(component.find(Controls).exists()).toEqual(true)
      expect(component.find(ModalCover).exists()).toEqual(true)
    })
  })
})
