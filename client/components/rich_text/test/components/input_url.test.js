import React from 'react'
import { mount } from 'enzyme'
import { RemoveButton } from 'client/components/remove_button'
import { TextInputUrl } from '../../components/input_url.jsx'

describe('TextInputUrl', () => {
  let props

  const getWrapper = (props) => {
    return mount(
      <TextInputUrl {...props} />
    )
  }

  beforeEach(() => {
    props = {
      confirmLink: jest.fn(),
      pluginType: undefined,
      removeLink: jest.fn(),
      selectionTarget: {
        left: 40,
        top: 20
      },
      urlValue: null
    }
  })

  it('Renders input and appy button', () => {
    const component = getWrapper(props)
    const input = component.find('input').getElement()
    const button = component.find('button').getElement()

    expect(input.props.placeholder).toBe('Paste or type a link')
    expect(input.props.value).toBe('')
    expect(button.props.children).toBe('Apply')
  })

  it('Sets the position to props.selectionTarget', () => {
    const component = getWrapper(props)
    const { style } = component.find('.TextInputUrl').getElement().props

    expect(style.left).toBe(props.selectionTarget.left)
    expect(style.top).toBe(props.selectionTarget.top)
  })

  it('Can render an existing link', () => {
    props.urlValue = 'http://artsy.net'
    const component = getWrapper(props)
    const input = component.find('input').getElement()

    expect(input.props.value).toBe('http://artsy.net')
  })

  it('Renders remove button if has url', () => {
    props.urlValue = 'http://artsy.net'
    const component = getWrapper(props)

    expect(component.find(RemoveButton).exists()).toBe(true)
  })

  it('Can input a url', () => {
    const component = getWrapper(props)
    const input = component.find('input')
    const value = 'http://link.com'

    input.simulate('change', {target: { value }})
    expect(component.state().url).toBe(value)
  })

  it('Can save a link', () => {
    const component = getWrapper(props)
    const url = 'http://link.com'
    const button = component.find('button')
    component.setState({ url })
    button.simulate('click')

    expect(props.confirmLink.mock.calls[0][0]).toBe(url)
  })

  it('Can save a link with plugins', () => {
    props.pluginType = 'artist'
    const component = getWrapper(props)
    const url = 'http://link.com'
    const button = component.find('button')
    component.setState({ url })
    button.simulate('click')

    expect(props.confirmLink.mock.calls[0][0]).toBe(url)
    expect(props.confirmLink.mock.calls[0][1]).toBe(props.pluginType)
  })

  it('Does not save empty links', () => {
    const component = getWrapper(props)
    const url = ''
    const button = component.find('button')
    component.setState({ url })
    button.simulate('click')

    expect(props.confirmLink.mock.calls.length).toBe(0)
    expect(props.removeLink.mock.calls.length).toBe(1)
  })

  it('Can remove a link', () => {
    props.urlValue = 'http://artsy.net'
    const component = getWrapper(props)
    component.find(RemoveButton).simulate('click')

    expect(props.removeLink.mock.calls.length).toBe(1)
  })
})
