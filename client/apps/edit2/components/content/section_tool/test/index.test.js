import React from 'react'
import Backbone from 'backbone'
import { mount } from 'enzyme'
import {
  Fixtures,
  IconEditEmbed,
  IconEditImages,
  IconEditText,
  IconEditVideo,
  IconHeroImage,
  IconHeroVideo
} from '@artsy/reaction-force/dist/Components/Publishing'
import { SectionTool } from '../index'
const { FeatureArticle } = Fixtures

describe('SectionTool', () => {
  const props = {
    isEditing: false,
    isHero: false,
    section: null,
    index: FeatureArticle.sections.length - 1,
    sections: new Backbone.Collection(FeatureArticle.sections)
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

  it('Adds a data-visible prop to the last section tool', () => {
    const component = mount(
      <SectionTool {...props} />
    )
    expect(component.html()).toMatch('data-visible="true"')
  })

  it('Adds a data-visible prop to the first section tool if no sections', () => {
    props.firstSection = true
    props.sections = new Backbone.Collection()
    const component = mount(
      <SectionTool {...props} />
    )
    expect(component.html()).toMatch('data-visible="true"')
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
