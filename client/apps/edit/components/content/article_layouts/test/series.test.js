import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../../models/article'
import { SeriesAbout } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesAbout'
import { SeriesTitle } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesTitle'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { EditSeries } from '../series'

describe('EditArticle', () => {
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

  xit('Can edit SeriesTitle', () => {
    const component = mount(
      <EditSeries {...props} />
    )
  })

  it('Renders SeriesAbout', () => {
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(SeriesAbout).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(1)
  })

  xit('Can edit SeriesAbout', () => {
    const component = mount(
      <EditSeries {...props} />
    )
  })
})
