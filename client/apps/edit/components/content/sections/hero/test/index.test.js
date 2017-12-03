import React from 'react'
import Backbone from 'backbone'
import { shallow } from 'enzyme'
import SectionContainer from '../../../section_container/index.coffee'
import SectionTool from '../../../section_tool/index.jsx'
import { SectionHero } from '../index.jsx'

import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
const { FeatureArticle } = Fixtures

describe('SectionHero', () => {
  const props = {
    section: new Backbone.Model(),
    sections: new Backbone.Collection(FeatureArticle.sections),
    channel: new Backbone.Model(),
    article: new Backbone.Model(FeatureArticle)
  }

  it('Displays a sectionTool if no section', () => {
    const component = shallow(
      <SectionHero {...props} />
    )
    expect(component.find(SectionTool).length).toBe(1)
    expect(component.find(SectionContainer).length).toBe(0)
  })

  it('Displays a sectionContainer has section', () => {
    props.section.set(FeatureArticle.sections[2])
    const component = shallow(
      <SectionHero {...props} />
    )
    expect(component.find(SectionTool).length).toBe(0)
    expect(component.find(SectionContainer).length).toBe(1)
  })
})
