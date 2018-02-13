import React from 'react'
import Backbone from 'backbone'
import { clone } from 'lodash'
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
  let props
  let sections

  const getWrapper = (props) => {
    return mount(
      <SectionTool {...props} />
    )
  }

  describe('In SectionList', () => {
    beforeEach(() => {
      sections = clone(FeatureArticle.sections)

      props = {
        isEditing: false,
        isHero: false,
        section: null,
        index: sections.length - 1,
        sections,
        newSectionAction: jest.fn()
      }
    })

    it('opens on click', () => {
      const component = getWrapper(props)
      component.find('.edit-tool__icon').simulate('click')

      expect(component.state().open).toBe(true)
    })

    it('renders the section icons when open', () => {
      const component = getWrapper(props)
      component.find('.edit-tool__icon').simulate('click')

      expect(component.find(IconEditText).exists()).toBe(true)
      expect(component.find(IconEditImages).exists()).toBe(true)
      expect(component.find(IconEditVideo).exists()).toBe(true)
      expect(component.find(IconEditEmbed).exists()).toBe(true)
    })

    it('adds a new section of the correct type on click', () => {
      const expectedIndex = props.sections.length
      const component = getWrapper(props)

      component.find('.edit-tool__icon').simulate('click')
      component.find(IconEditText).simulate('click')
      expect(props.newSectionAction.mock.calls[0][0]).toBe('text')
      expect(props.newSectionAction.mock.calls[0][1]).toBe(expectedIndex)
    })

    it('Adds a data-visible prop to the last section tool', () => {
      const component = getWrapper(props)
      expect(component.html()).toMatch('data-visible="true"')
    })

    it('Adds a data-visible prop to the first section tool if no sections', () => {
      props.firstSection = true
      props.sections = []
      const component = getWrapper(props)

      expect(component.html()).toMatch('data-visible="true"')
    })
  })

  describe('SectionTool: Hero', () => {
    beforeEach(() => {
      props = {
        isEditing: false,
        isHero: true,
        section: {},
        index: -1,
        sections: clone(FeatureArticle.sections),
        onSetEditing: jest.fn(),
        newHeroSectionAction: jest.fn()
      }
    })

    it('opens on click', () => {
      const component = getWrapper(props)
      component.find('.edit-tool__icon').simulate('click')

      expect(component.state().open).toBe(true)
    })

    it('renders the section icons when open', () => {
      const component = getWrapper(props)
      component.find('.edit-tool__icon').simulate('click')

      expect(component.find(IconHeroImage).exists()).toBe(true)
      expect(component.find(IconHeroVideo).exists()).toBe(true)
    })

    it('adds a new section of the correct type on click', () => {
      const component = getWrapper(props)
      component.find('.edit-tool__icon').simulate('click')
      component.find(IconHeroImage).simulate('click')

      expect(props.newHeroSectionAction.mock.calls[0][0]).toBe('image_collection')
      expect(props.onSetEditing.mock.calls[0][0]).toBe(true)
    })
  })
})
