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
      channel: { type: 'editorial' },
      onChange: jest.fn(),
      onChangeHero: jest.fn()
    }
  })

  it('Does not render SectionHero if channel does not have feature', () => {
    const component = getWrapper(props)
    expect(component.find(SectionHero).exists()).toBe(false)
  })

  it('Renders SectionHero if channel has feature', () => {
    props.channel.type = 'team'
    const component = getWrapper(props)
    expect(component.find(SectionHero).exists()).toBe(true)
  })

  it('Renders SectionHeader', () => {
    const component = getWrapper(props)
    expect(component.find(SectionHeader).exists()).toBe(true)
  })

  it('Renders SectionList', () => {
    const component = getWrapper(props)
    expect(component.find(SectionList).exists()).toBe(true)
  })

  it('Renders SectionFooter', () => {
    const component = getWrapper(props)
    expect(component.find(SectionFooter).exists()).toBe(true)
  })
})
