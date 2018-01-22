import React from 'react'
import { mount } from 'enzyme'
import Section from '/client/models/section.coffee'
import { SectionControls } from '../index'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
const { StandardArticle, FeatureArticle } = Fixtures

describe('Section Controls', () => {
  let props

  const getWrapper = (props) => {
    return mount(
      <SectionControls {...props} />
    )
  }

  beforeAll(() => {
    SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
    SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
    $.fn.offset = jest.fn().mockReturnValue({top: 200})
    $.fn.height = jest.fn().mockReturnValue(200)
    $.fn.closest = jest.fn().mockReturnValue(true)
  })

  beforeEach(() => {
    props = {
      channel: { type: 'editorial' },
      section: new Section(StandardArticle.sections[4]),
      articleLayout: 'standard',
      onChange: jest.fn(),
      disabledAlert: jest.fn(),
      sectionLayouts: true
    }
  })

  describe('Section Layouts', () => {
    it('does not render section layouts unless sectionLayouts', () => {
      props.sectionLayouts = false
      const component = getWrapper(props)

      expect(component.find('.layout').length).toBe(0)
    })

    it('renders section layouts if sectionLayouts is true', () => {
      const component = getWrapper(props)

      expect(component.find('.layout').length).toBe(3)
    })

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

    it('renders image_set icon if channel.hasFeature and section is images', () => {
      props.channel.type = 'team'
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="image_set"')
    })

    it('does not render image_set icon if section is not images', () => {
      props.section = new Section(StandardArticle.sections[0])
      const component = getWrapper(props)

      expect(component.html()).not.toMatch('<a name="image_set"')
    })

    it('shows a fullscreen icon if layout is feature and section has images', () => {
      props.section = new Section(StandardArticle.sections[4])
      props.articleLayout = 'feature'
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="fillwidth')
    })

    it('shows a fullscreen icon if layout is feature and section is embed', () => {
      props.section = new Section(StandardArticle.sections[10])
      props.articleLayout = 'feature'
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="fillwidth')
    })

    it('shows a fullscreen icon if layout is feature and section is video', () => {
      props.section = new Section(FeatureArticle.sections[6])
      props.articleLayout = 'feature'
      const component = getWrapper(props)

      expect(component.html()).toMatch('<a name="fillwidth')
    })
  })

  describe('#changeLayout', () => {
    it('changes the layout on click', () => {
      const component = getWrapper(props)

      component.find('.layout').at(1).simulate('click')
      expect(component.instance().props.section.get('layout')).toMatch('column_width')
    })

    it('when toggling fullscreen, alerts the user if too many images', () => {
      props.articleLayout = 'feature'
      const component = getWrapper(props)

      component.find('.layout').at(2).simulate('click')
      expect(props.disabledAlert.mock.calls.length).toBe(1)
      expect(component.instance().props.section.get('layout')).toMatch('overflow_fillwidth')
    })

    it('can convert an image_set into an image_collection', () => {
      props.section.set({ type: 'image_set', layout: 'null' })
      const component = getWrapper(props)

      component.find('.layout').at(1).simulate('click')
      expect(component.instance().props.section.get('layout')).toMatch('column_width')
      expect(component.instance().props.section.get('type')).toMatch('image_collection')
    })
  })

  describe('#toggleImageSet', () => {
    it('converts an image_collection to an image_set', () => {
      const component = getWrapper(props)

      component.find('.layout').at(2).simulate('click')
      expect(component.instance().props.section.get('type')).toMatch('image_set')
    })

    it('does nothing if section is already an image_set', () => {
      props.section.set({ type: 'image_set', layout: 'null' })
      const component = getWrapper(props)

      component.find('.layout').at(2).simulate('click')
      expect(component.instance().props.section.get('type')).toMatch('image_set')
    })
  })

  describe('#setInsideComponent', () => {
    it('returns true if item is scrolled over and not scrolled past', () => {
      const component = getWrapper(props)

      component.instance().setInsideComponent()
      expect(component.state().insideComponent).toBe(true)
    })

    it('returns false if item is scrolled past', () => {
      SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(true)
      const component = getWrapper(props)

      component.instance().setInsideComponent()
      expect(component.state().insideComponent).toBe(false)
    })

    it('returns false when hero section', () => {
      SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
      props.isHero = true
      const component = getWrapper(props)

      component.instance().setInsideComponent()
      expect(component.state().insideComponent).toBe(false)
    })
  })

  describe('#getHeaderSize', () => {
    it('returns 55 when channel is not artsy channel', () => {
      props.channel.type = 'partner'
      const component = getWrapper(props)
      const header = component.instance().getHeaderSize()

      expect(header).toBe(55)
    })

    it('returns 95 when channel is artsy channel', () => {
      const component = getWrapper(props)
      const header = component.instance().getHeaderSize()

      expect(header).toBe(95)
    })
  })

  describe('#getPositionBottom', () => {
    it('when insideComponent, calculates based on window scroll position', () => {
      props.isHero = false
      const component = getWrapper(props)

      component.instance().setState({insideComponent: true})
      const bottom = component.instance().getPositionBottom()
      expect(bottom).toBe(605)
    })

    it('when outside component, returns 100%', () => {
      const component = getWrapper(props)

      component.instance().setState({insideComponent: false})
      const bottom = component.instance().getPositionBottom()
      expect(bottom).toBe('100%')
    })
  })
})
