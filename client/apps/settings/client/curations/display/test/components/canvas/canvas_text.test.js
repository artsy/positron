import React from 'react'
import { CanvasText } from '../../../components/canvas/canvas_text.jsx'
import { PlainText } from '/client/components/rich_text/components/plain_text.jsx'
import { mount } from 'enzyme'

describe('Canvas Text', () => {
  const props = {
    campaign: {
      canvas: {assets: []},
      panel: {assets: []}
    },
    index: 0,
    onChange: jest.fn()
  }

  it('Can save an edited headline', () => {
    const component = mount(
      <CanvasText {...props} />
    )
    const input = component.find('input').at(0)
    input.simulate('change', { target: { value: 'New Headline' } })

    expect(props.onChange.mock.calls[0][0]).toMatch('canvas.headline')
    expect(props.onChange.mock.calls[0][1]).toMatch('New Headline')
    expect(props.onChange.mock.calls[0][2]).toBe(0)
  })

  it('Can save an edited overlay body', () => {
    props.campaign.canvas.layout = 'overlay'
    const component = mount(
      <CanvasText {...props} />
    )
    component.find(PlainText).at(0).node.props.onChange('New Body')
    expect(props.onChange.mock.calls[1][0]).toMatch('canvas.headline')
    expect(props.onChange.mock.calls[1][1]).toMatch('New Body')
    expect(props.onChange.mock.calls[1][2]).toBe(0)
  })

  it('Can save an edited CTA Text', () => {
    const component = mount(
      <CanvasText {...props} />
    )
    const input = component.find('input').at(0)
    input.simulate('change', { target: { value: 'Read More' } })

    expect(props.onChange.mock.calls[2][0]).toMatch('canvas.link.text')
    expect(props.onChange.mock.calls[2][1]).toMatch('Read More')
    expect(props.onChange.mock.calls[2][2]).toBe(0)
  })

  it('Can save an edited CTA Link', () => {
    const component = mount(
      <CanvasText {...props} />
    )
    const input = component.find('input').at(1)
    input.simulate('change', { target: { value: 'http://artsy.net' } })

    expect(props.onChange.mock.calls[3][0]).toMatch('canvas.link.url')
    expect(props.onChange.mock.calls[3][1]).toMatch('http://artsy.net')
    expect(props.onChange.mock.calls[3][2]).toBe(0)
  })

  it('Can save an edited Disclaimer', () => {
    const component = mount(
      <CanvasText {...props} />
    )
    component.find(PlainText).at(1).node.props.onChange('New Disclaimer')
    expect(props.onChange.mock.calls[4][0]).toMatch('canvas.disclaimer')
    expect(props.onChange.mock.calls[4][1]).toMatch('New Disclaimer')
    expect(props.onChange.mock.calls[4][2]).toBe(0)
  })
})
