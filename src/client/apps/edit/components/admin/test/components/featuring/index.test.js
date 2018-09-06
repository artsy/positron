import configureStore from 'redux-mock-store'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { AutocompleteList } from '/client/components/autocomplete2/list'
import { AdminFeaturing } from '../../../components/featuring'
import { FeaturingMentioned } from '../../../components/featuring/featuring_mentioned'
require('typeahead.js')

describe('AdminFeaturing', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const { article, featured, mentioned } = props

    const store = mockStore({
      app: {
        channel: { type: 'editorial' }
      },
      edit: {
        article,
        featured,
        mentioned
      }
    })

    return mount(
      <Provider store={store}>
        <AdminFeaturing {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    let article = cloneDeep(StandardArticle)

    props = {
      article,
      featured: {
        artist: [{
          _id: '123',
          name: 'Pablo Picasso'
        }],
        artwork: []
      },
      mentioned: { artist: [], artwork: [] },
      metaphysicsURL: 'https://metaphysics-staging.artsy.net',
      model: 'artist',
      onChangeArticleAction: jest.fn()
    }
  })

  it('Renders autocomplete fields', () => {
    const component = getWrapper(props)
    expect(component.find(AutocompleteList).length).toBe(6)
  })

  it('Renders feature/mentioned fields', () => {
    const component = getWrapper(props)
    expect(component.find(FeaturingMentioned).length).toBe(2)
  })
})
