import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../../models/article'
import SectionList from '../../section_list/index'
import { SectionFooter } from '../../sections/footer/index'
import { SectionHeader } from '../../sections/header/index'
import { SectionHero } from '../../sections/hero/index'
import { EditArticle } from '../article'

describe('EditArticle', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      channel: {
        hasFeature: jest.fn().mockReturnValueOnce(false)
      },
      onChange: jest.fn()
    }
  })

  it('Does not SectionHero if channel does not have feature', () => {
    const component = mount(
      <EditArticle {...props} />
    )
    expect(component.find(SectionHero).length).toBe(0)
  })

  it('Renders SectionHero if channel has feature', () => {
    props.channel.hasFeature = jest.fn().mockReturnValueOnce(true)
    const component = mount(
      <EditArticle {...props} />
    )
    expect(component.find(SectionHero).length).toBe(1)
  })

  it('Renders SectionHeader', () => {
    const component = mount(
      <EditArticle {...props} />
    )
    expect(component.find(SectionHeader).length).toBe(1)
  })

  it('Renders SectionList', () => {
    const component = mount(
      <EditArticle {...props} />
    )
    expect(component.find(SectionList).length).toBe(1)
  })

  it('Renders SectionFooter', () => {
    const component = mount(
      <EditArticle {...props} />
    )
    expect(component.find(SectionFooter).length).toBe(1)
  })
})
