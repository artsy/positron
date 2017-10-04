import PlainText from '../components/plain_text.jsx'
import React from 'react'
import { mount } from 'enzyme'
import { EditorState } from 'draft-js'

describe('PlainText', () => {
  const props = {
    name: 'title'
  }

  it('renders a draft editor with placeholder', () => {
    const wrapper = mount(
      <PlainText {...props} />
    )
    expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
    expect(wrapper.html()).toMatch('class="public-DraftEditor-content" contenteditable="true"')
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
    wrapper.instance().focus = jest.fn()
    wrapper.update()
    wrapper.simulate('click')
    expect(wrapper.instance().focus).toHaveBeenCalled()
  })

  it('does not allow linebreaks', () => {
    props.onChange = jest.fn()
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
    props.onChange = jest.fn()
    const wrapper = mount(
      <PlainText {...props} />
    )
    wrapper.instance().refs.editor.focus()
    wrapper.find('.public-DraftEditor-content').simulate('keyUp', { keyCode: 70, which: 70 })
    expect(wrapper.instance().props.onChange).toHaveBeenCalled()
  })

})
