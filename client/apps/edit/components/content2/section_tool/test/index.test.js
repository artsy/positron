import React from 'react'
import Backbone from 'backbone'
import { mount } from 'enzyme'

import components from '@artsy/reaction-force/dist/components/publishing/index'
import SectionTool from '../index.jsx'

const IconEditEmbed = components.Icon.EditEmbed
const IconEditImages = components.Icon.EditImages
const IconEditText = components.Icon.EditText
const IconEditVideo = components.Icon.EditVideo

const IconHeroImage = components.Icon.HeroImage
const IconHeroVideo = components.Icon.HeroVideo

const { FeatureArticle } = components.Fixtures

describe('SectionTool', () => {

  const props = {
    isEditing: false,
    isHero: false,
    section: null,
    index: FeatureArticle.sections.length - 1,
    sections: new Backbone.Collection(FeatureArticle.sections),
  }

  it('opens on click', () => {
    const component = mount(
      <SectionTool {...props} />
    )
    component.find('.edit-tool__icon').simulate('click')
    expect(component.state().open).toBe(true)
  })
  it('renders the section icons when open', () => {
    const component = mount(
      <SectionTool {...props} />
    )
    component.find('.edit-tool__icon').simulate('click')
    expect(component.find(IconEditText).length).toBe(1)
    expect(component.find(IconEditImages).length).toBe(1)
    expect(component.find(IconEditVideo).length).toBe(1)
    expect(component.find(IconEditEmbed).length).toBe(1)
  })
  it('adds a new section of the correct type on click', () => {
    const originalSections = props.sections.length
    const component = mount(
      <SectionTool {...props} />
    )
    component.find('.edit-tool__icon').simulate('click')
    component.find(IconEditText).simulate('click')
    expect(component.props().sections.length).toBe(originalSections + 1)
    expect(component.props().sections.pop().get('type')).toMatch('text')
  })
})

describe('SectionTool: Hero', () => {

  const props = {
    isEditing: false,
    isHero: true,
    section: new Backbone.Model,
    index: -1,
    sections: new Backbone.Collection(FeatureArticle.sections),
    onSetEditing: jest.fn()
  }

  it('opens on click', () => {
    const component = mount(
      <SectionTool {...props} />
    )
    component.find('.edit-tool__icon').simulate('click')
    expect(component.state().open).toBe(true)
  })

  it('renders the section icons when open', () => {
    const component = mount(
      <SectionTool {...props} />
    )
    component.find('.edit-tool__icon').simulate('click')
    expect(component.find(IconHeroImage).length).toBe(1)
    expect(component.find(IconHeroVideo).length).toBe(1)
  })

  it('adds a new section of the correct type on click', () => {
    const component = mount(
      <SectionTool {...props} />
    )
    component.find('.edit-tool__icon').simulate('click')
    component.find(IconHeroImage).simulate('click')
    expect(component.props().section.get('type')).toMatch('image_collection')
    expect(props.onSetEditing.mock.calls[0][0]).toBe(true)
  })
})
