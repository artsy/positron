import React from 'react'
import Backbone from 'backbone'
import { shallow } from 'enzyme'

import HeroSection from '../index.jsx'
import SectionContainer from '../../../section_container/index.coffee'
import SectionTool from '../../../section_tool/index.jsx'

import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
const { FeatureArticle } = Fixtures

describe('HeroSection', () => {
  const props = {
    section: new Backbone.Model(),
    sections: new Backbone.Collection(FeatureArticle.sections),
    channel: new Backbone.Model(),
    article: new Backbone.Model(FeatureArticle)
  }

  it('Displays a sectionTool if no section', () => {
    const component = shallow(
      <HeroSection {...props} />
    )
    expect(component.find(SectionTool).length).toBe(1)
    expect(component.find(SectionContainer).length).toBe(0)
  })

  it('Displays a sectionContainer has section', () => {
    props.section.set(FeatureArticle.sections[2])
    const component = shallow(
      <HeroSection {...props} />
    )
    expect(component.find(SectionTool).length).toBe(0)
    expect(component.find(SectionContainer).length).toBe(1)
  })
})
