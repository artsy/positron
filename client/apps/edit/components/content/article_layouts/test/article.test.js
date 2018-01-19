import React from 'react'
import { shallow } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from 'client/models/article.coffee'
import SectionFooter from '../../sections/footer'
import SectionList from '../../section_list'
import { SectionHeader } from '../../sections/header'
import { SectionHero } from '../../sections/hero'
import { EditArticle } from '../article'

describe('EditArticle', () => {
  let props

  const getWrapper = (props) => {
    return shallow(
      <EditArticle {...props} />
    )
  }

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      channel: {
        hasFeature: jest.fn().mockReturnValue(false)
      },
      onChange: jest.fn(),
      onChangeHero: jest.fn()
    }
  })

  it('Does not render SectionHero if channel does not have feature', () => {
    const component = getWrapper(props)
    expect(component.find(SectionHero).length).toBe(0)
  })

  it('Renders SectionHero if channel has feature', () => {
    props.channel.hasFeature = jest.fn().mockReturnValueOnce(true)
    const component = getWrapper(props)
    expect(component.find(SectionHero).length).toBe(1)
  })

  it('Renders SectionHeader', () => {
    const component = getWrapper(props)
    expect(component.find(SectionHeader).length).toBe(1)
  })

  it('Renders SectionList', () => {
    const component = getWrapper(props)
    expect(component.find(SectionList).length).toBe(1)
  })

  it('Renders SectionFooter', () => {
    const component = getWrapper(props)
    expect(component.find(SectionFooter).length).toBe(1)
  })
})
