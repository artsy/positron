import React from 'react'
import { EditError } from '../index'
import { mount } from 'enzyme'

describe('EditError', () => {
  let props

  beforeEach(() => {
    props = {
      actions: {
        resetError: jest.fn()
      },
      error: {
        message: 'Error Message'
      }
    }
  })

  it('Displays an error message', () => {
    const component = mount(
      <EditError {...props} />
    )
    expect(component.text()).toMatch(props.error.message)
  })

  it('Resets the error state on click', () => {
    const component = mount(
      <EditError {...props} />
    )
    component.simulate('click')
    expect(props.actions.resetError.mock.calls.length).toBe(1)
  })
})
