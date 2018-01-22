import React from 'react'
import Backbone from 'backbone'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { RemoveButton } from 'client/components/remove_button'
import { SectionContainer } from '../../../section_container'
import { SectionTool } from '../../../section_tool'
import { SectionHero } from '../index'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
const { ClassicArticle } = Fixtures

describe('SectionHero', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {}
      },
      edit: {
        article: {}
      }
    })

    return mount(
      <Provider store={store}>
        <SectionHero {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: new Backbone.Model(ClassicArticle),
      onChange: jest.fn()
    }
  })

  it('Displays a sectionTool if no section', () => {
    props.article.set('hero_section', null)
    const component = getWrapper(props)

    expect(component.find(SectionTool).exists()).toBe(true)
    expect(component.find(SectionContainer).exists()).toBe(false)
  })

  it('Displays a sectionContainer has section', () => {
    props.article.set({
      hero_section: {
        url: 'http://youtube.com',
        type: 'video'
      }
    })
    const component = getWrapper(props)

    expect(component.find(SectionTool).exists()).toBe(false)
    expect(component.find(SectionContainer).exists()).toBe(true)
  })

  it('Can remove a hero if empty', () => {
    props.article.set({
      hero_section: {
        type: 'video'
      }
    })
    const component = getWrapper(props)

    component.find(RemoveButton).simulate('click')
    expect(props.onChange.mock.calls[1][0]).toBe('hero_section')
    expect(props.onChange.mock.calls[1][1]).toBe(null)
  })
})
