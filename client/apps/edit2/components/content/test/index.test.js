import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction/dist/Components/Publishing'
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
        channel: props.channel
      },
      edit: {
        article: props.article,
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
      article: cloneDeep(Fixtures.StandardArticle),
      channel: {
        type: 'editorial',
        hasFeature: jest.fn().mockReturnThis()
      }
    }
  })

  it('Renders EditArticle if article layout is not series', () => {
    const component = getWrapper(props)

    expect(component.find(EditArticle).exists()).toBe(true)
    expect(component.find(EditSeries).exists()).toBe(false)
  })

  it('Renders EditSeries if article layout is series', () => {
    props.article.layout = 'series'
    const component = getWrapper(props)

    expect(component.find(EditSeries).exists()).toBe(true)
    expect(component.find(EditArticle).exists()).toBe(false)
  })

  it('Renders EditVideo if article layout is video', () => {
    props.article.layout = 'video'
    const component = getWrapper(props)

    expect(component.find(EditVideo).exists()).toBe(true)
    expect(component.find(EditArticle).exists()).toBe(false)
  })
})
