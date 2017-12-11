import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../../models/article'
import { SeriesAbout } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesAbout'
import { SeriesTitle } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesTitle'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { RelatedArticles } from '/client/apps/edit/components/content/sections/related_articles'
import { EditSeries } from '../series'
require('typeahead.js')

describe('EditSeries', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.SeriesArticle),
      channel: {
        hasFeature: jest.fn().mockReturnValueOnce(false)
      },
      onChange: jest.fn()
    }
  })

  it('Renders SeriesTitle', () => {
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(SeriesTitle).length).toBe(1)
    expect(component.find(PlainText).length).toBe(1)
  })

  it('Renders RelatedArticles list', () => {
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(RelatedArticles).length).toBe(1)
  })

  it('Renders SeriesAbout', () => {
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(SeriesAbout).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(1)
  })
})
