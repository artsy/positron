import { mount } from 'enzyme'
import React from 'react'
import { IconRemove } from '@artsy/reaction/dist/Components/Publishing/Icon/IconRemove'
import { RemoveButton } from '../index'

describe('RemoveButton', () => {
  let props

  beforeEach(() => {
    props = {
      onClick: jest.fn()
    }
  })

  it('Renders the remove icon with default colors', () => {
    const component = mount(
      <RemoveButton {...props} />
    )
    expect(component.find(IconRemove).length).toBe(1)
    expect(component.find(IconRemove).props().background).toBe('black')
    expect(component.find(IconRemove).props().color).toBe('white')
  })

  it('Renders a className if provided', () => {
    props.className = 'image-remove'

    const component = mount(
      <RemoveButton {...props} />
    )
    expect(component.html()).toMatch(props.className)
  })

  it('Passes a background color to icon if provided', () => {
    props.background = 'red'
    const component = mount(
      <RemoveButton {...props} />
    )
    expect(component.find(IconRemove).props().background).toBe('red')
  })

  it('Passes a fill color to icon if provided', () => {
    props.color = 'red'
    const component = mount(
      <RemoveButton {...props} />
    )
    expect(component.find(IconRemove).props().color).toBe('red')
  })

  it('Calls props.onClick on click', () => {
    props.color = 'red'
    const component = mount(
      <RemoveButton {...props} />
    )
    component.simulate('click')
    expect(props.onClick.mock.calls.length).toBe(1)
  })
})
