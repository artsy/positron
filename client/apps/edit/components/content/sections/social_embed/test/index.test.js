import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction/dist/Components/Publishing'
import { SocialEmbed } from '@artsy/reaction/dist/Components/Publishing/Sections/SocialEmbed'
import { SectionSocialEmbed } from '../index'
import { SocialEmbedControls } from '../controls'

const { NewsArticle } = Fixtures

describe('Section Embed', () => {
  let props

  beforeEach(() => {
    props = {
      article: NewsArticle,
      section: NewsArticle.sections[10]
    }
  })

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {}
      },
      edit: {
        article: NewsArticle,
        section: NewsArticle.sections[10]
      }
    })

    return mount(
      <Provider store={store}>
        <SectionSocialEmbed {...props} />
      </Provider>
    )
  }

  it('Renders saved data', () => {
    const component = getWrapper(props)
    expect(component.find(SocialEmbed).exists()).toBe(true)
  })

  it('Renders placeholder if empty', () => {
    props.section = {}
    const component = getWrapper(props)

    expect(component.find(SocialEmbed).exists()).toBe(false)
    expect(component.text()).toBe('Add URL above')
  })

  it('Renders controls if editing', () => {
    props.editing = true
    const component = getWrapper(props)

    expect(component.find(SocialEmbedControls).exists()).toBe(true)
  })
})
