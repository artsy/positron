import React from 'react'
import configureStore from 'redux-mock-store'
import { NewsArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { NewsHeadline } from '@artsy/reaction/dist/Components/Publishing/News/NewsHeadline'
import { NewsByline } from '@artsy/reaction/dist/Components/Publishing/Byline/NewsByline'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { SectionList } from '../../section_list'
import { EditNews } from '../news'

describe('EditNews', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: props.channel
      },
      edit: {
        article: props.article
      }
    })

    return mount(
      <Provider store={store}>
        <EditNews {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      channel: { type: 'editorial' },
      article: NewsArticle
    }
  })

  it('Renders NewsHeadline', () => {
    const component = getWrapper(props)
    expect(component.find(NewsHeadline).exists()).toBe(true)
  })

  it('Renders SectionList', () => {
    const component = getWrapper(props)
    expect(component.find(SectionList).exists()).toBe(true)
  })

  it('Renders NewsByline', () => {
    const component = getWrapper(props)
    expect(component.find(NewsByline).exists()).toBe(true)
  })
})
