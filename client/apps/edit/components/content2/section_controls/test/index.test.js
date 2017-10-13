import React from 'react'
import sinon from 'sinon'
import { mount } from 'enzyme'
import Channel from '/client/models/channel.coffee'
import Section from '/client/models/section.coffee'
import SectionControls from '../index.jsx'
import components from '@artsy/reaction-force/dist/Components/Publishing/index'
const { StandardArticle, FeatureArticle } = components.Fixtures

describe('Section Controls', () => {
  beforeAll(() => {
    SectionControls.prototype.isScrollingOver = sinon.stub().returns(true)
    SectionControls.prototype.isScrolledPast = sinon.stub().returns(false)
    $.fn.offset = sinon.stub().returns({top: 200})
    $.fn.height = sinon.stub().returns(200)
    $.fn.closest = sinon.stub().returns(true)
  })

  const props = {
    channel: new Channel(),
    section: new Section(StandardArticle.sections[4]),
    articleLayout: 'standard',
    onChange: sinon.stub(),
    disabledAlert: sinon.stub()
  }

  describe('Section Layouts', () => {
    it('does not render section layouts unless sectionLayouts', () => {
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.find('.layout').length).toBe(0)
    })

    it('renders section layouts if sectionLayouts is true', () => {
      props.sectionLayouts = true
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.find('.layout').length).toBe(2)
    })

    it('adds a data-active attr to the current section layout icon', () => {
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.html()).toMatch(
        '<a name="overflow_fillwidth" class="layout" data-active="true">'
      )
    })

    it('does not render image_set icon if channel.hasFeature is false', () => {
      Channel.prototype.hasFeature = sinon.stub().returns(false)
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.html()).not.toMatch('<a name="image_set"')
    })

    it('renders image_set icon if channel.hasFeature and section is images', () => {
      Channel.prototype.hasFeature = sinon.stub().returns(true)
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.html()).toMatch('<a name="image_set"')
    })

    it('does not render image_set icon if section is not images', () => {
      props.section = new Section(StandardArticle.sections[0])
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.html()).not.toMatch('<a name="image_set"')
    })

    it('shows a fullscreen icon if layout is feature and section has images', () => {
      props.section = new Section(StandardArticle.sections[4])
      props.articleLayout = 'feature'
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.html()).toMatch('<a name="fillwidth')
    })

    it('shows a fullscreen icon if layout is feature and section is embed', () => {
      props.section = new Section(StandardArticle.sections[10])
      props.articleLayout = 'feature'
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.html()).toMatch('<a name="fillwidth')
    })

    it('shows a fullscreen icon if layout is feature and section is video', () => {
      props.section = new Section(FeatureArticle.sections[6])
      props.articleLayout = 'feature'
      const component = mount(
        <SectionControls {...props} />
      )
      expect(component.html()).toMatch('<a name="fillwidth')
    })
  })

  describe('#changeLayout', () => {
    it('changes the layout on click', () => {
      props.section = new Section(StandardArticle.sections[4])
      const component = mount(
        <SectionControls {...props} />
      )
      component.find('.layout').at(1).simulate('click')
      expect(component.instance().props.section.get('layout')).toMatch('column_width')
    })

    it('when toggling fullscreen, alerts the user if too many images', () => {
      const component = mount(
        <SectionControls {...props} />
      )
      component.find('.layout').at(2).simulate('click')
      expect(props.disabledAlert.called).toBe(true)
      expect(component.instance().props.section.get('layout')).toMatch('column_width')
    })

    it('can convert an image_set into an image_collection', () => {
      props.section.set({ type: 'image_set', layout: 'null' })
      const component = mount(
        <SectionControls {...props} />
      )
      component.find('.layout').at(1).simulate('click')
      expect(component.instance().props.section.get('layout')).toMatch('column_width')
      expect(component.instance().props.section.get('type')).toMatch('image_collection')
    })
  })

  describe('#toggleImageSet', () => {

    it('converts an image_collection to an image_set', () => {
      props.section = new Section(StandardArticle.sections[4])
      const component = mount(
        <SectionControls {...props} />
      )
      component.find('.layout').at(3).simulate('click')
      expect(component.instance().props.section.get('type')).toMatch('image_set')
    })

    it('does nothing if section is already an image_set', () => {
      props.section.set({ type: 'image_set', layout: 'null' })
      const component = mount(
        <SectionControls {...props} />
      )
      component.find('.layout').at(3).simulate('click')
      expect(component.instance().props.section.get('type')).toMatch('image_set')
    })
  })

  describe('#setInsideComponent', () => {
    it('returns true if item is scrolled over and not scrolled past', () => {
      props.section = new Section(StandardArticle.sections[4])
      const component = mount(
        <SectionControls {...props} />
      )
      component.instance().setInsideComponent()
      expect(component.state().insideComponent).toBe(true)
    })

    it('returns false if item is scrolled past', () => {
      SectionControls.prototype.isScrolledPast = sinon.stub().returns(true)
      const component = mount(
        <SectionControls {...props} />
      )
      component.instance().setInsideComponent()
      expect(component.state().insideComponent).toBe(false)
    })

    it('returns false when hero section', () => {
      SectionControls.prototype.isScrolledPast = sinon.stub().returns(false)
      props.isHero = true
      const component = mount(
        <SectionControls {...props} />
      )
      component.instance().setInsideComponent()
      expect(component.state().insideComponent).toBe(false)
    })
  })

  describe('#getHeaderSize', () => {
    it('returns 55 when channel is not editorial', () => {
      const component = mount(
        <SectionControls {...props} />
      )
      const header = component.instance().getHeaderSize()
      expect(header).toBe(55)
    })

    it('returns 95 when channel is editorial', () => {
      Channel.prototype.isEditorial = sinon.stub().returns(true)
      Channel.prototype.hasFeature = sinon.stub().returns(true)
      const component = mount(
        <SectionControls {...props} />
      )
      const header = component.instance().getHeaderSize()
      expect(header).toBe(95)
    })
  })

  describe('#getPositionBottom', () => {
    it('when insideComponent, calculates based on window scroll position', () => {
      props.isHero = false
      const component = mount(
        <SectionControls {...props} />
      )
      component.instance().setState({insideComponent: true})
      const bottom = component.instance().getPositionBottom()
      expect(bottom).toBe(605)
    })

    it('when outside component, returns 100%', () => {
      const component = mount(
        <SectionControls {...props} />
      )
      component.instance().setState({insideComponent: false})
      const bottom = component.instance().getPositionBottom()
      expect(bottom).toBe('100%')
    })
  })
})
