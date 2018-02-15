import React from 'react'
import { mount } from 'enzyme'
import { Fixtures, IconDrag, IconRemove } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '/client/models/article.coffee'
import Channel from '/client/models/channel.coffee'
import Section from '/client/models/section.coffee'
import { RemoveButton } from 'client/components/remove_button'
import SectionSlideshow from '../../sections/slideshow'
import { SectionText } from '../../sections/text/index.jsx'
import { SectionEmbed } from '../../sections/embed'
import { SectionImages } from '../../sections/images'
import { SectionVideo } from '../../sections/video'
import { SectionContainer } from '../index'
const { StandardArticle } = Fixtures

describe('SectionContainer', () => {
  let props

  beforeEach(() => {
    const article = new Article(StandardArticle)

    props = {
      article: article,
      channel: new Channel(),
      editing: false,
      index: 1,
      isHero: false,
      onRemoveHero: jest.fn(),
      onSetEditing: jest.fn(),
      section: article.sections.models[1],
      sections: article.sections
    }
  })

  it('Renders drag and remove icons', () => {
    const component = mount(
      <SectionContainer {...props} />
    )
    expect(component.find(IconRemove).length).toBe(1)
    expect(component.find(IconDrag).length).toBe(1)
  })

  it('Calls onSetEditing with index on section click', () => {
    const component = mount(
      <SectionContainer {...props} />
    )
    component.find('.SectionContainer__hover-controls').at(0).simulate('click')
    expect(props.onSetEditing.mock.calls[0][0]).toBe(props.index)
  })

  it('Calls onSetEditing with null on click off', () => {
    props.editing = true
    const component = mount(
      <SectionContainer {...props} />
    )

    component.find('.SectionContainer__hover-controls').at(0).simulate('click')
    expect(props.onSetEditing.mock.calls[0][0]).toBe(null)
  })

  it('Can remove a section click', () => {
    const spy = jest.spyOn(props.section, 'destroy')
    const component = mount(
      <SectionContainer {...props} />
    )
    component.find(RemoveButton).at(0).simulate('click')
    expect(spy).toHaveBeenCalled()
  })

  it('#getContentStartEnd finds the first and last text section', () => {
    const component = mount(
      <SectionContainer {...props} />
    )
    const startEnd = component.instance().getContentStartEnd()

    expect(startEnd.start).toBe(0)
    expect(startEnd.end).toBe(17)
  })

  describe('Sections', () => {
    it('Can render an embed section', () => {
      props.section = new Section({type: 'embed'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionEmbed).length).toBe(1)
    })

    it('Can render an image section', () => {
      props.section = new Section({type: 'image'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionImages).length).toBe(1)
    })

    it('Can render an image_collection section', () => {
      props.section = new Section({type: 'image_collection'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionImages).length).toBe(1)
    })

    it('Can render an image_set section', () => {
      props.section = new Section({type: 'image_set'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionImages).length).toBe(1)
    })

    it('Can render a slideshow section', () => {
      props.section = new Section({type: 'slideshow'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionSlideshow).length).toBe(1)
    })

    it('Can render a text section', () => {
      props.section = new Section({type: 'text'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionText).length).toBe(1)
    })

    it('Can render a video section', () => {
      props.section = new Section({type: 'video'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionVideo).length).toBe(1)
    })
  })

  describe('Hero Section', () => {
    beforeEach(() => {
      props.section = new Section({isHero: true})
    })

    it('Can render an image section', () => {
      props.section.set({type: 'image_set'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionImages).length).toBe(1)
    })

    it('Can render a video section', () => {
      props.section.set({type: 'video'})
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(SectionVideo).length).toBe(1)
    })

    it('Does not render drag icon', () => {
      const component = mount(
        <SectionContainer {...props} />
      )
      expect(component.find(IconDrag).length).toBe(1)
    })

    it('Can remove a hero section', () => {
      const spy = jest.spyOn(props.section, 'destroy')
      const component = mount(
        <SectionContainer {...props} />
      )
      component.find(RemoveButton).at(0).simulate('click')
      expect(spy).toHaveBeenCalled()
    })
  })
})
