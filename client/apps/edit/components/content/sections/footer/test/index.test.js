import React from 'react'
import Backbone from 'backbone'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Paragraph from '../../../../../../../components/rich_text/components/paragraph.coffee'
import { SectionFooter } from '../index.jsx'
const { FeatureArticle } = Fixtures

describe('SectionFooter', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Backbone.Model(FeatureArticle),
      channel: {
        hasFeature: jest.fn().mockReturnValue(true)
      },
      onChange: jest.fn()
    }
  })

  it('Shows a postscript field if channel hasFeature', () => {
    props.article.unset('postscript')
    const component = mount(
      <SectionFooter {...props} />
    )

    expect(component.find(Paragraph).length).toBe(1)
    expect(component.text()).toMatch('Postscript (optional)')
  })

  it('Does not a postscript field if channel does not hasFeature', () => {
    props.channel.hasFeature.mockReturnValue(false)
    const component = mount(
      <SectionFooter {...props} />
    )

    expect(component.find(Paragraph).length).toBe(0)
    expect(component.text()).not.toMatch('Postscript (optional)')
  })

  it('Can render a saved postscript', () => {
    const component = mount(
      <SectionFooter {...props} />
    )
    const expectedPostscript = FeatureArticle.postscript
      .replace('<p>', '')
      .replace('</p>', '')
    expect(component.html()).toMatch(expectedPostscript)
  })
})
