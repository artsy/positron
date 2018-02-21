import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { clone } from 'lodash'
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
        article: props.article
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
      article: clone(ClassicArticle),
      onChangeArticleAction: jest.fn()
    }
  })

  it('Displays a sectionTool if no section', () => {
    props.article.hero_section = null
    const component = getWrapper(props)

    expect(component.find(SectionTool).exists()).toBe(true)
    expect(component.find(SectionContainer).exists()).toBe(false)
  })

  it('Displays a sectionContainer with video section', () => {
    props.article.hero_section = {
      url: 'http://youtube.com',
      type: 'video'
    }

    const component = getWrapper(props)

    expect(component.find(SectionTool).exists()).toBe(false)
    expect(component.find(SectionContainer).exists()).toBe(true)
  })

  it('Displays a sectionContainer with image section', () => {
    props.article.hero_section = {
      images: [],
      type: 'image'
    }

    const component = getWrapper(props)

    expect(component.find(SectionTool).exists()).toBe(false)
    expect(component.find(SectionContainer).exists()).toBe(true)
  })

  it('Can remove a hero if empty', () => {
    props.article.hero_section = {
      type: 'image'
    }

    const component = getWrapper(props)

    component.find(RemoveButton).simulate('click')
    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('hero_section')
    expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(null)
  })
})
