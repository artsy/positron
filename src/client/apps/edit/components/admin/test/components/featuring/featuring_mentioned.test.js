import configureStore from 'redux-mock-store'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { Provider } from 'react-redux'
import { FeaturingMentioned } from '../../../components/featuring/featuring_mentioned'
import { MentionedList } from '../../../components/featuring/mentioned_list'
import { AutocompleteListMetaphysics } from 'client/components/autocomplete2/list_metaphysics'
require('typeahead.js')

describe('FeaturingMentioned', () => {
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
        <FeaturingMentioned {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(StandardArticle),
      featured: { artist: [], artwork: [] },
      mentioned: { artist: [], artwork: [] },
      model: 'artist'
    }
  })

  it('Renders a label', () => {
    const component = getWrapper(props)

    expect(component.find('label').first().text()).toBe('artists')
  })

  it('Renders expected components', () => {
    const component = getWrapper(props)

    expect(component.find(AutocompleteListMetaphysics).exists()).toBe(true)
    expect(component.find(MentionedList).exists()).toBe(true)
  })
})
