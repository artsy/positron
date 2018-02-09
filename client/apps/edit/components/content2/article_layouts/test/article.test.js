import configureStore from 'redux-mock-store'
import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { Provider } from 'react-redux'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import { SectionFooter } from '../../sections/footer'
import { SectionHeader } from '../../sections/header'
import { SectionHero } from '../../sections/hero'
import { SectionList } from '../../section_list'
import { EditArticle } from '../article'

describe('EditArticle', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])

    const store = mockStore({
      app: {
        channel: props.channel
      },
      edit: {
        activeView: props.activeView,
        article: props.article,
        error: props.error
      }
    })

    return mount(
      <Provider store={store}>
        <EditArticle {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: clone(Fixtures.StandardArticle),
      channel: { type: 'editorial' },
      onChange: jest.fn(),
      onChangeHero: jest.fn()
    }
  })

  it('Does not render SectionHero if channel does not have feature', () => {
    const component = getWrapper(props)
    expect(component.find(SectionHero).exists()).toBe(false)
  })

  it('Renders SectionHero if channel has feature', () => {
    props.channel.type = 'team'
    const component = getWrapper(props)

    expect(component.find(SectionHero).exists()).toBe(true)
  })

  it('Renders SectionHeader', () => {
    const component = getWrapper(props)
    expect(component.find(SectionHeader).exists()).toBe(true)
  })

  it('Renders SectionList', () => {
    const component = getWrapper(props)
    expect(component.find(SectionList).exists()).toBe(true)
  })

  it('Renders SectionFooter', () => {
    const component = getWrapper(props)
    expect(component.find(SectionFooter).exists()).toBe(true)
  })
})
