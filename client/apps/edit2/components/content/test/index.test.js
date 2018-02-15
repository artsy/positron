import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { EditArticle } from '../article_layouts/article'
import { EditSeries } from '../article_layouts/series'
import { EditVideo } from '../article_layouts/video'
import { EditContent } from '../index'
require('typeahead.js')

describe('EditContent', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {hasFeature: jest.fn().mockReturnThis()}
      },
      edit: {
        article: Fixtures.StandardArticle,
        lastUpdated: new Date()
      }
    })
    return mount(
      <Provider store={store}>
        <EditContent {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      onChange: jest.fn(),
      onChangeHero: jest.fn()
    }
  })

  it('Renders EditArticle if article layout is not series', () => {
    const component = getWrapper(props)

    expect(component.find(EditArticle).exists()).toBe(true)
    expect(component.find(EditSeries).exists()).toBe(false)
  })

  it('Renders EditSeries if article layout is series', () => {
    props.article.set('layout', 'series')
    const component = getWrapper(props)

    expect(component.find(EditSeries).exists()).toBe(true)
    expect(component.find(EditArticle).exists()).toBe(false)
  })

  it('Renders EditVideo if article layout is video', () => {
    props.article.set('layout', 'video')
    const component = getWrapper(props)

    expect(component.find(EditVideo).exists()).toBe(true)
    expect(component.find(EditArticle).exists()).toBe(false)
  })
})
