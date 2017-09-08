import React from 'react'
import Controls from '../controls.jsx'
import { mount } from 'enzyme'

import components from '@artsy/reaction-force/dist/components/publishing/index'
const Fullscreen = components.Icon.LayoutFullscreen
const Split = components.Icon.LayoutSplit
const Text = components.Icon.LayoutText

describe('Feature Header Controls', () => {

  const props = {
    onChange: jest.fn()
  }

  it('renders menu prompt', () => {
    const wrapper = mount(
      <Controls {...props} />
    )
    expect(wrapper.html()).toMatch('<div class="edit-header--controls-open">Change Header</div>')
    expect(wrapper.state().isOpen).toBe(false)
  })

  it('opens the menu on click', () => {
    const wrapper = mount(
      <Controls {...props} />
    )
    wrapper.find('.edit-header--controls-open').simulate('click')
    expect(wrapper.state().isOpen).toBe(true)
    expect(wrapper.find(Fullscreen).length).toBe(1)
    expect(wrapper.find(Split).length).toBe(1)
    expect(wrapper.find(Text).length).toBe(1)
  })

  it('changes the layout click', () => {
    const wrapper = mount(
      <Controls {...props} />
    )
    wrapper.find('.edit-header--controls-open').simulate('click')
    wrapper.find('a').first().simulate('click')
    expect(props.onChange.mock.calls[0][0]).toMatch('type')
    expect(props.onChange.mock.calls[0][1]).toMatch('text')
  })
})