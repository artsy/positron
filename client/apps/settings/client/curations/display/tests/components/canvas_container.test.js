import React from 'react'
import Canvas from '../../components/canvas.jsx'
import CanvasContainer from '../../components/canvas_container.jsx'
import { mount } from 'enzyme'

describe('Canvas Container', () => {
  const props = {
    campaign: {
      canvas: {},
      panel: {}
    },
    index: 0,
    onChange: jest.fn()
  }

  it('Renders all fields', () => {
    const component = mount(
      <CanvasContainer {...props} />
    )
    expect(component.find('.display-admin--canvas__layouts button').length).toBe(3)
    expect(component.find(Canvas).length).toBe(1)
  })

  it('Sets the canvas layout to overlay by default', () => {
    const component = mount(
      <CanvasContainer {...props} />
    )
    expect(component.find('.display-admin--canvas__layouts button').at(0).props()['data-active']).toBe(true)
  })

  it('Changes the canvas layout on button click', () => {
    const component = mount(
      <CanvasContainer {...props} />
    )
    component.find('.display-admin--canvas__layouts button').at(2).simulate('click')
    expect(props.onChange.mock.calls[0][0]).toMatch('canvas.layout')
    expect(props.onChange.mock.calls[0][1]).toMatch('slideshow')
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })
})
