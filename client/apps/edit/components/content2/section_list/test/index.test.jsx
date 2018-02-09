import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
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
        article: props.article,
        sectionIndex: props.sectionIndex
      }
    })

    return mount(
      <Provider store={store}>
        <SectionList {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    article = clone(Fixtures.StandardArticle)

    props = {
      article,
      sectionIndex: null,
      setSectionAction: jest.fn()
    }
  })

  xit('Renders the sections', () => {
    const component = getWrapper(props)
    expect(component.find(SectionContainer).length).toBe(props.article.sections.length)
  })

  xit('Renders the section tools', () => {
    const component = getWrapper(props)
    expect(component.find(SectionTool).length).toBe(props.article.sections.length + 1)
  })

  it('Renders drag container more than 1 section', () => {
    const component = getWrapper(props)
    expect(component.find(DragContainer).exists()).toBe(true)
  })

  it('Does not render drag container if no sections', () => {
    props.article.sections = []
    const component = getWrapper(props)

    expect(component.find(DragContainer).exists()).toBe(false)
  })

  it('Does not render drag container if 1 section', () => {
    props.article.sections = [{type: 'embed'}]
    const component = getWrapper(props)

    expect(component.find(DragContainer).exists()).toBe(false)
    expect(component.find(SectionContainer).length).toBe(props.article.sections.length)
  })

  it('Listens for a new section and dispatches setSection with index', () => {
    const { sections } = props.article
    const newSection = {type: 'embed'}
    sections.push(newSection)
    const component = getWrapper(props).find(SectionList)
    component.instance().onNewSection(newSection)

    expect(component.props().setSectionAction.mock.calls[0][0]).toBe(sections.length - 1)
  })
})
