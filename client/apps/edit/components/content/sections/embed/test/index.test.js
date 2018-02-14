import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Embed, Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import { SectionEmbed } from '../index'
import { EmbedControls } from '../controls'

const { StandardArticle } = Fixtures

describe('Section Embed', () => {
  let props

  beforeEach(() => {
    props = {
      article: StandardArticle,
      section: StandardArticle.sections[10]
    }
  })

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {}
      },
      edit: {
        article: StandardArticle,
        section: StandardArticle.sections[10]
      }
    })

    return mount(
      <Provider store={store}>
        <SectionEmbed {...props} />
      </Provider>
    )
  }

  it('Renders saved data', () => {
    const component = getWrapper(props)
    expect(component.find(Embed).exists()).toBe(true)
  })

  it('Renders placeholder if empty', () => {
    props.section = {}
    const component = getWrapper(props)

    expect(component.find(Embed).exists()).toBe(false)
    expect(component.text()).toBe('Add URL above')
  })

  it('Renders controls if editing', () => {
    props.editing = true
    const component = getWrapper(props)

    expect(component.find(EmbedControls).exists()).toBe(true)
  })
})
