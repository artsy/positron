import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Sections from 'client/collections/sections.coffee'
import DragContainer from 'client/components/drag_drop/index.coffee'
import { SectionContainer } from '../../section_container'
import { SectionTool } from '../../section_tool'
import { SectionList } from '../index'

describe('SectionList', () => {
  let props
  let article

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {}
      },
      edit: {
        article: Fixtures.StandardArticle
      }
    })

    return mount(
      <Provider store={store}>
        <SectionList {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    article = Fixtures.StandardArticle

    props = {
      sectionIndex: null,
      setSectionAction: jest.fn(),
      sections: new Sections(article.sections)
    }
  })

  it('Renders the sections', () => {
    const component = getWrapper(props)
    expect(component.find(SectionContainer).length).toBe(article.sections.length)
  })

  it('Renders the section tools', () => {
    const component = getWrapper(props)
    expect(component.find(SectionTool).length).toBe(article.sections.length + 1)
  })

  it('Renders drag container more than 1 section', () => {
    const component = getWrapper(props)
    expect(component.find(DragContainer).exists()).toBe(true)
  })

  it('Does not render drag container if 1 or no sections', () => {
    props.sections.reset()
    const component = getWrapper(props)

    expect(component.find(DragContainer).exists()).toBe(false)
  })

  it('Does not render drag container if 1 section', () => {
    props.sections.reset([{type: 'embed'}])
    const component = getWrapper(props)

    expect(component.find(DragContainer).exists()).toBe(false)
    expect(component.find(SectionContainer).length).toBe(props.sections.length)
  })

  it('Listens for a new section and dispatches setSection with index', () => {
    const component = getWrapper(props).find(SectionList)

    component.instance().onNewSection({type: 'embed'})
    component.props().sections.add(
      {type: 'embed'},
      {at: 3}
    )
    expect(component.props().setSectionAction.mock.calls[1][0]).toBe(3)
  })
})
