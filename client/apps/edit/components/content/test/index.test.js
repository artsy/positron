import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { EditArticle } from '../article_layouts/article'
import { EditSeries } from '../article_layouts/series'
import { EditContent } from '../index'

describe('EditContent', () => {
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

  it('Renders EditArticle if article layout is not series', () => {
    const component = mount(
      <EditContent {...props} />
    )
    expect(component.find(EditArticle).length).toBe(1)
    expect(component.find(EditSeries).length).toBe(0)
  })

  it('Renders EditSeries if article layout is series', () => {
    props.article.set('layout', 'series')
    const component = mount(
      <EditContent {...props} />
    )
    expect(component.find(EditSeries).length).toBe(1)
    expect(component.find(EditArticle).length).toBe(0)
  })
})
