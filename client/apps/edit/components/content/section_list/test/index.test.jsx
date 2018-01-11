import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from 'client/models/article.coffee'
import Channel from 'client/models/channel.coffee'
import DragContainer from 'client/components/drag_drop/index.coffee'
import { SectionContainer } from '../../section_container/index'
import { SectionTool } from '../../section_tool/index'
import { SectionList } from '../index'

describe('SectionList', () => {
  let props
  let article

  beforeEach(() => {
    article = new Article(Fixtures.StandardArticle)

    props = {
      actions: {
        changeSection: jest.fn()
      },
      article,
      channel: new Channel(),
      edit: {
        activeSection: null
      },
      sections: article.sections
    }
  })

  it('Renders the sections', () => {
    const component = mount(
      <SectionList {...props} />
    )
    expect(component.find(SectionContainer).length).toBe(props.article.sections.length)
  })

  it('Renders the section tools', () => {
    const component = mount(
      <SectionList {...props} />
    )
    expect(component.find(SectionTool).length).toBe(props.article.sections.length + 1)
  })

  it('Renders drag container more than 1 section', () => {
    const component = mount(
      <SectionList {...props} />
    )
    expect(component.find(DragContainer).length).not.toBe(0)
  })

  it('Does not render drag container if 1 or no sections', () => {
    props.sections.reset()
    const component = mount(
      <SectionList {...props} />
    )
    expect(component.find(DragContainer).length).toBe(0)
  })

  it('Does not render drag container if 1 section', () => {
    props.sections.reset([{type: 'embed'}])
    const component = mount(
      <SectionList {...props} />
    )
    expect(component.find(DragContainer).length).toBe(0)
    expect(component.find(SectionContainer).length).toBe(props.article.sections.length)
  })

  it('Listens for a new section and dispatches changeSection with index', () => {
    const component = mount(
      <SectionList {...props} />
    )
    component.instance().onNewSection({type: 'embed'})
    component.props().sections.add(
      {type: 'embed'},
      {at: 3}
    )
    expect(component.props().actions.changeSection.mock.calls[1][0]).toBe(3)
  })
})
