import React from 'react'
import { shallow } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { EditArticle } from '../article_layouts/article'
import { EditSeries } from '../article_layouts/series'
import { EditContent } from '../index'
require('typeahead.js')

describe('EditContent', () => {
  let props

  const getWrapper = (props) => {
    return shallow(
      <EditContent {...props} />
    )
  }

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      channel: {
        hasFeature: jest.fn().mockReturnValueOnce(false)
      },
      onChange: jest.fn(),
      onChangeHero: jest.fn()
    }
  })

  it('Renders EditArticle if article layout is not series', () => {
    const component = getWrapper(props)
    expect(component.find(EditArticle).length).toBe(1)
    expect(component.find(EditSeries).length).toBe(0)
  })

  it('Renders EditSeries if article layout is series', () => {
    props.article.set('layout', 'series')
    const component = getWrapper(props)
    expect(component.find(EditSeries).length).toBe(1)
    expect(component.find(EditArticle).length).toBe(0)
  })
})
