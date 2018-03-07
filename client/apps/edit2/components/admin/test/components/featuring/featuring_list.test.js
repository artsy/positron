import configureStore from 'redux-mock-store'
import request from 'superagent'
import { cloneDeep } from 'lodash'
import { mount, shallow } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { Fixtures } from '@artsy/reaction/dist/Components/Publishing'
import { FeaturingList } from '../../../components/featuring/featuring_list'
import { ListItem } from 'client/components/autocomplete2/list'

jest.mock('superagent', () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.fn().mockReturnValue(
      {
        end: jest.fn()
      }
    )
  }
})

describe('FeaturingList', () => {
  let props
  let response

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
        <FeaturingList {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(Fixtures.StandardArticle),
      featured: {
        artist: [{
          _id: '123',
          name: 'Pablo Picasso'
        }],
        artwork: [{
          _id: '456',
          title: 'Stripes'
        }]
      },
      mentioned: {artist: [], artwork: []},
      metaphysicsURL: 'https://metaphysics-staging.artsy.net',
      model: 'artist',
      onFetchFeaturedAction: jest.fn(),
      user: { access_token: '' }
    }

    response = {
      body: {
        data: {
          artists: [{
            _id: '123',
            name: 'Pablo Picasso'
          }]
        }
      }
    }
  })

  it('Renders featured artists', () => {
    const component = getWrapper(props)

    expect(component.find(ListItem).exists()).toBe(true)
    expect(component.text()).toMatch(props.featured.artist[0].name)
  })

  it('Renders featured artworks', () => {
    props.model = 'artwork'
    const component = getWrapper(props)

    expect(component.find(ListItem).exists()).toBe(true)
    expect(component.text()).toMatch(props.featured.artwork[0].title)
  })

  it('Calls #fetchFeatured on mount', () => {
    props.article.primary_featured_artist_ids = ['123']
    request.query().end.mockImplementation(() => {
      props.onFetchFeaturedAction('artist', response.body.data.artists)
    })
    const component = shallow(
      <FeaturingList {...props} />
    )
    component.instance().fetchFeatured()

    expect(props.onFetchFeaturedAction.mock.calls[0][0]).toBe(props.model)
    expect(props.onFetchFeaturedAction.mock.calls[0][1][0].name).toBe('Pablo Picasso')
  })
})
