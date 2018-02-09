import React from 'react'
import { MessageModal } from '../index'
import { ModalTypes } from '../modalTypes'
import { shallow } from 'enzyme'

describe('MessageModal', () => {
  it('renders lock modal', () => {
    const type = 'locked'
    const data = ModalTypes[type]
    const component = shallow(<MessageModal {...getProps(type)} />)
    expect(component.find('Header').dive().text()).toContain(data.header.text)
    expect(component.find('Title').dive().text()).toEqual(data.title)
    expect(component.find('ActionButton').length).toEqual(1)
  })

  it('renders timeout modal', () => {
    const type = 'timeout'
    const data = ModalTypes[type]
    const component = shallow(<MessageModal {...getProps(type)} />)
    expect(component.find('Header').dive().text()).toContain(data.header.text)
    expect(component.find('Title').dive().text()).toEqual(data.title)
    expect(component.find('ActionButton').length).toEqual(2)
  })
})

let getProps = type => ({
  type,
  session: {
    timestamp: '2018-01-30T23:12:20.973Z',
    user: {
      name: 'John Doe',
      email: 'joe@artsymail.com',
      id: '123',
      current_channel: {
        id: '1',
        name: 'Artsy Editorial',
        type: 'editorial'
      }
    }
  },
  onClose: jest.fn(),
  onTimerEnded: jest.fn()
})