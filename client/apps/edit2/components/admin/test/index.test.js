import configureStore from 'redux-mock-store'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { Fixtures } from '@artsy/reaction/dist/Components/Publishing'
import { DropDownList } from 'client/components/drop_down/drop_down_list'
import { AdminTags } from '../components/tags'
import { AdminVerticalsTags } from '../components/verticals_tags'
import { EditAdmin } from '../index.jsx'
require('typeahead.js')

describe('EditAdmin', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const { article, channel } = props

    const store = mockStore({
      app: { channel },
      edit: { article }
    })

    return mount(
      <Provider store={store}>
        <EditAdmin {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(Fixtures.FeatureArticle),
      channel: { type: 'editorial' }
    }
  })

  it('Renders dropdown', () => {
    const component = getWrapper(props)
    expect(component.find(DropDownList).exists()).toBe(true)
  })

  it('Renders editorial sections', () => {
    const component = getWrapper(props)

    expect(component.find(AdminVerticalsTags).exists()).toBe(true)
    expect(component.html()).toMatch('Super Article')
    expect(component.html()).toMatch('Sponsor')
  })

  it('Renders correct sections for non-editorial channels', () => {
    props.channel.type = 'partner'
    const component = getWrapper(props)

    expect(component.find(AdminTags).exists()).toBe(true)
    expect(component.find(AdminVerticalsTags).exists()).toBe(false)
    expect(component.html()).not.toMatch('Super Article')
    expect(component.html()).not.toMatch('Sponsor')
  })
})
