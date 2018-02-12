import configureStore from 'redux-mock-store'
import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { LayoutControls } from '../layout.jsx'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
const { StandardArticle, FeatureArticle } = Fixtures

describe('Section LayoutControls', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: props.channel
      },
      edit: {
        article: props.article,
        section: props.section,
        sectionIndex: props.sectionIndex
      }
    })

    return mount(
      <Provider store={store}>
        <section>
          <LayoutControls {...props} />
        </section>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      channel: { type: 'editorial' },
      section: clone(StandardArticle.sections[4]),
      article: {layout: 'standard'},
      onChangeSectionAction: jest.fn(),
      disabledAlert: jest.fn()
    }
  })

  describe('Section Layouts', () => {
    it('adds a data-active attr to the current section layout icon', () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch(
        '<a name="overflow_fillwidth" class="layout" data-active="true">'
      )
    })

    it('does not render image_set icon for support or partner channels', () => {
      props.channel.type = 'partner'
      const component = getWrapper(props)

      expect(component.html()).not.toMatch('<a name="image_set"')
    })

    it('renders image_set icon if channel has features and section is images', () => {
      props.channel.type = 'team'
      props.section = StandardArticle.sections[4]
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="image_set"')
    })

    it('does not render image_set icon if section is not images', () => {
      props.section = StandardArticle.sections[0]
      const component = getWrapper(props)

      expect(component.html()).not.toMatch('<a name="image_set"')
    })

    it('shows a fullscreen icon if layout is feature and section has images', () => {
      props.section = StandardArticle.sections[4]
      props.article.layout = 'feature'
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="fillwidth')
    })

    it('shows a fullscreen icon if layout is feature and section is embed', () => {
      props.section = StandardArticle.sections[10]
      props.article.layout = 'feature'
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="fillwidth')
    })

    it('shows a fullscreen icon if layout is feature and section is video', () => {
      props.section = FeatureArticle.sections[6]
      props.article.layout = 'feature'
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="fillwidth')
    })
  })

  describe('#changeLayout', () => {
    it('changes the layout on click', () => {
      const component = getWrapper(props)

      component.find('.layout').at(1).simulate('click')
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('layout')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe('column_width')
    })

    it('when toggling fullscreen, alerts the user if too many images', () => {
      props.article.layout = 'feature'
      const component = getWrapper(props)

      component.find('.layout').at(2).simulate('click')
      expect(props.disabledAlert.mock.calls.length).toBe(1)
      expect(props.onChangeSectionAction).not.toBeCalled()
    })

    it('can convert an image_set into an image_collection', () => {
      props.section.type = 'image_set'
      delete props.section.layout

      const component = getWrapper(props)

      component.find('.layout').at(1).simulate('click')
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('type')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe('image_collection')
      expect(props.onChangeSectionAction.mock.calls[1][0]).toBe('layout')
      expect(props.onChangeSectionAction.mock.calls[1][1]).toBe('column_width')
    })
  })

  describe('#toggleImageSet', () => {
    it('converts an image_collection to an image_set', () => {
      const component = getWrapper(props)

      component.find('.layout').at(2).simulate('click')
      expect(props.onChangeSectionAction.mock.calls[0][0]).toBe('type')
      expect(props.onChangeSectionAction.mock.calls[0][1]).toBe('image_set')
      expect(props.onChangeSectionAction.mock.calls[1][0]).toBe('layout')
      expect(props.onChangeSectionAction.mock.calls[1][1]).toBe('mini')
    })

    it('does nothing if section is already an image_set', () => {
      props.section.type = 'image_set'
      props.section.layout = 'mini'
      const component = getWrapper(props)

      component.find('.layout').at(2).simulate('click')
      expect(props.onChangeSectionAction).not.toBeCalled()
    })
  })
})
