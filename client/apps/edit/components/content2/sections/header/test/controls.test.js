import React from 'react'
import Controls from '../controls.jsx'
import { mount } from 'enzyme'

import { Icon } from '@artsy/reaction-force/dist/Components/Publishing'
const Fullscreen = Icon.IconLayoutFullscreen
const Split = Icon.IconLayoutSplit
const Text = Icon.IconLayoutText

describe('Feature Header Controls', () => {

  const props = {
    onChange: jest.fn()
  }

  it('renders menu prompt', () => {
    const component = mount(
      <Controls {...props} />
    )
    expect(component.html()).toMatch('<div class="edit-header--controls-open">Change Header</div>')
    expect(component.state().isOpen).toBe(false)
  })

  it('opens the menu on click', () => {
    const component = mount(
      <Controls {...props} />
    )
    component.find('.edit-header--controls-open').simulate('click')
    expect(component.state().isOpen).toBe(true)
    expect(component.find(Fullscreen).length).toBe(1)
    expect(component.find(Split).length).toBe(1)
    expect(component.find(Text).length).toBe(1)
  })

  it('changes the layout click', () => {
    const component = mount(
      <Controls {...props} />
    )
    component.find('.edit-header--controls-open').simulate('click')
    component.find('a').first().simulate('click')
    expect(props.onChange.mock.calls[0][0]).toMatch('type')
    expect(props.onChange.mock.calls[0][1]).toMatch('text')
  })
})