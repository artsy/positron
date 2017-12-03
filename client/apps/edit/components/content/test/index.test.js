import Backbone from 'backbone'
import React from 'react'
import Article from '../../../../../models/article'
import { EditContent } from '../index'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import SectionList from '../section_list/index'
import { SectionFooter } from '../sections/footer/index'
import { SectionHeader } from '../sections/header/index'

describe('EditContent', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      channel: new Backbone.Model(),
      onChange: jest.fn()
    }
  })

  it('Renders SectionHeader', () => {
    const component = mount(
      <EditContent {...props} />
    )
    expect(component.find(SectionHeader).length).toBe(1)
  })

  it('Renders SectionList', () => {
    const component = mount(
      <EditContent {...props} />
    )
    expect(component.find(SectionList).length).toBe(1)
  })

  it('Renders SectionFooter', () => {
    const component = mount(
      <EditContent {...props} />
    )
    expect(component.find(SectionFooter).length).toBe(1)
  })
})
