import React from 'react'
import Controls from '../controls.jsx'
import { mount } from 'enzyme'
import {
  IconLayoutFullscreen,
  IconLayoutSplit,
  IconLayoutText
} from '@artsy/reaction-force/dist/Components/Publishing'

describe('Feature Header Controls', () => {

  const props = {
    onChange: jest.fn()
  }

  it('renders menu prompt', () => {
    const component = mount(
      <Controls {...props} />
    )
    expect(component.html()).toMatch('class="edit-header--controls-open"')
    expect(component.html()).toMatch('Change Header')
    expect(component.state().isOpen).toBe(false)
  })

  it('opens the menu on click', () => {
    const component = mount(
      <Controls {...props} />
    )
    component.find('.edit-header--controls-open').simulate('click')
    expect(component.state().isOpen).toBe(true)
    expect(component.find(IconLayoutFullscreen).length).toBe(1)
    expect(component.find(IconLayoutSplit).length).toBe(1)
    expect(component.find(IconLayoutText).length).toBe(1)
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