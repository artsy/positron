import FileInput from '../index.jsx'
import gemup from 'gemup'
import React from 'react'
import { mount } from 'enzyme'

jest.mock('gemup', () => {
  return jest.fn()
})

describe('FileInput', () => {
  beforeAll(() => {
    global.window.$.ajax = jest.fn()
    global.alert = jest.fn()
  })

  it('renders drag-drop container', () => {
    const component = mount(
      <FileInput />
    )
    expect(component.find('.file-input').text()).toMatch('Drag & Drop or Click to Upload')
  })

  it('renders the default size limit', () => {
    const component = mount(
      <FileInput />
    )
    expect(component.find('.file-input').text()).toMatch('Up to 30MB')
  })

  it('renders props.sizeLimit', () => {
    const component = mount(
      <FileInput sizeLimit={10} />
    )
    expect(component.find('.file-input').text()).toMatch('Up to 10MB')
  })

  it('prompts to replace file if hasImage', () => {
    const component = mount(
      <FileInput hasImage />
    )
    expect(component.find('.file-input').text()).toMatch('Drag & Drop or Click to Replace')
  })

  it('accepts image files by default', () => {
    const component = mount(
      <FileInput />
    )
    expect(component.find('.file-input').html()).toMatch(
      '<input type="file" accept=".jpg,.jpeg,.png,.gif">'
    )
  })

  it('accepts video files when video prop is passed', () => {
    const component = mount(
      <FileInput video />
    )
    expect(component.find('.file-input').html()).toMatch(
      '<input type="file" accept=".jpg,.jpeg,.png,.gif,.mp4">'
    )
  })

  it('disables the input when disabled prop is passed', () => {
    const component = mount(
      <FileInput disabled />
    )
    expect(component.html()).toMatch('<div class="file-input disabled">')
  })

  it('calls upload when a file is selected', () => {
    const component = mount(
      <FileInput />
    )
    const file = new Blob([], {type: 'img/jpg'})
    component.find('input').simulate('change', {target: {files: [file]}})
    expect(gemup).toHaveBeenCalled()
  })
})
