import { PlainText } from '../../components/plain_text.jsx'
import React from 'react'
import { mount } from 'enzyme'

describe('PlainText', () => {
  const props = {
    name: 'title',
    onChange: jest.fn()
  }
  window.scrollTo = jest.fn()

  it('renders a draft editor with placeholder', () => {
    const wrapper = mount(
      <PlainText {...props} />
    )
    expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
    expect(wrapper.html()).toMatch('public-DraftEditor-content" contenteditable="true"')
    expect(wrapper.html()).toMatch('Start Typing...')
    expect(wrapper.html()).toMatch('public-DraftEditorPlaceholder-inner')
  })

  it('can accept a placeholder as props', () => {
    props.placeholder = 'Title (required)'
    const wrapper = mount(
      <PlainText {...props} />
    )
    expect(wrapper.html()).toMatch('Title (required)')
  })

  it('can render saved content', () => {
    props.content = 'Comparing the Costs of Being an Emerging Artist in New York, Los Angeles, and Berlin'
    const wrapper = mount(
      <PlainText {...props} />
    )
    expect(wrapper.html()).toMatch('Comparing the Costs of Being an Emerging Artist in New York, Los Angeles, and Berlin')
  })

  it('focuses on click', () => {
    const wrapper = mount(
      <PlainText {...props} />
    )
    const spy = jest.spyOn(wrapper.instance(), 'focus')
    wrapper.update()
    // FIXME TEST: Not sure why this has to be called twice
    wrapper.simulate('click')
    wrapper.simulate('click')
    expect(spy).toHaveBeenCalled()
  })

  it('does not allow linebreaks', () => {
    const wrapper = mount(
      <PlainText {...props} />
    )
    wrapper.instance().handleReturn = jest.fn()
    wrapper.update()
    wrapper.instance().refs.editor.focus()
    wrapper.find('.public-DraftEditor-content').simulate('keyDown', { keyCode: 13, which: 13 })
    expect(wrapper.instance().handleReturn).toHaveBeenCalled()
  })

  it('calls props.onChange when content changes', () => {
    const wrapper = mount(
      <PlainText {...props} />
    )
    wrapper.instance().refs.editor.focus()
    wrapper.find('.public-DraftEditor-content').simulate('keyUp', { keyCode: 70, which: 70 })
    setTimeout(
      () => expect(wrapper.instance().props().onChange).toHaveBeenCalled(),
      250
    )
  })
})
