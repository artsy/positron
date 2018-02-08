import configureStore from 'redux-mock-store'
import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { Fixtures, IconDrag } from '@artsy/reaction-force/dist/Components/Publishing'
import { RemoveButton } from 'client/components/remove_button'
import SectionSlideshow from '../../sections/slideshow'
import SectionText from '../../sections/text'
import { SectionEmbed } from '../../sections/embed'
import { SectionImages } from '../../sections/images'
import { SectionVideo } from '../../sections/video'
import { SectionContainer } from '../index'
const { StandardArticle } = Fixtures
require('typeahead.js')

describe('SectionContainer', () => {
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
        sectionIndex: props.index
      }
    })

    return mount(
      <Provider store={store}>
        <SectionContainer {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    const article = clone(StandardArticle)

    props = {
      article: article,
      channel: {type: 'editorial'},
      editing: false,
      index: 1,
      isHero: false,
      onRemoveHero: jest.fn(),
      onSetEditing: jest.fn(),
      section: {type: 'image_collection', layout: 'overflow_fillwidth'},
      sections: article.sections,
      removeSectionAction: jest.fn()
    }
  })

  it('Renders drag and remove icons', () => {
    const component = getWrapper(props)
    expect(component.find(RemoveButton).length).toBe(1)
    expect(component.find(IconDrag).length).toBe(1)
  })

  it('Calls onSetEditing with index on section click', () => {
    const component = getWrapper(props)
    component.find('.SectionContainer__hover-controls').at(0).simulate('click')
    expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index)
  })

  it('Calls onSetEditing with null on click off', () => {
    props.editing = true
    const component = getWrapper(props)

    component.find('.SectionContainer__hover-controls').at(0).simulate('click')
    expect(props.onSetEditing.mock.calls[0][0]).toBe(null)
  })

  it('Can remove a section click', () => {
    const component = getWrapper(props)
    component.find(RemoveButton).at(0).simulate('click')

    expect(props.removeSectionAction.mock.calls[0][0]).toBe(props.index)
  })

  xit('#getContentStartEnd finds the first and last text section', () => {
    const component = getWrapper(props)
    const startEnd = component.instance().getContentStartEnd()

    expect(startEnd.start).toBe(0)
    expect(startEnd.end).toBe(17)
  })

  describe('Sections', () => {
    it('Can render an embed section', () => {
      props.section = {type: 'embed'}
      const component = getWrapper(props)
      expect(component.find(SectionEmbed).length).toBe(1)
    })

    it('Can render an image section', () => {
      props.section = {type: 'image'}
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    it('Can render an image_collection section', () => {
      props.section = {type: 'image_collection'}
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    it('Can render an image_set section', () => {
      props.section = {type: 'image_set'}
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    xit('Can render a slideshow section', () => {
      props.section = {type: 'slideshow'}
      const component = getWrapper(props)
      expect(component.find(SectionSlideshow).length).toBe(1)
    })

    xit('Can render a text section', () => {
      props.section = {type: 'text'}
      const component = getWrapper(props)
      expect(component.find(SectionText).length).toBe(1)
    })

    it('Can render a video section', () => {
      props.section = {type: 'video'}
      const component = getWrapper(props)
      expect(component.find(SectionVideo).length).toBe(1)
    })
  })

  describe('Hero Section', () => {
    beforeEach(() => {
      props.isHero = true
    })

    it('Can render an image section', () => {
      props.section.type = 'image_set'
      const component = getWrapper(props)
      expect(component.find(SectionImages).length).toBe(1)
    })

    it('Can render a video section', () => {
      props.section.type = 'video'
      const component = getWrapper(props)
      expect(component.find(SectionVideo).length).toBe(1)
    })

    it('Does not render drag icon', () => {
      const component = getWrapper(props)
      expect(component.find(IconDrag).length).toBe(0)
    })

    it('Can remove a hero section', () => {
      const component = getWrapper(props)
      component.find(RemoveButton).at(0).simulate('click')

      expect(props.onRemoveHero).toBeCalled()
    })
  })
})
