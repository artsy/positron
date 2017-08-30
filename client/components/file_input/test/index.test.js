import FileInput from '../index.jsx';
import gemup from 'gemup';
import React from 'react';
import { mount } from 'enzyme';

jest.mock('gemup', () => {
  return jest.fn()
})

describe('FileInput', () => {
  beforeAll(() => {
    global.window.$ = jest.fn()
    global.window.$.ajax = jest.fn()
    global.alert = jest.fn()
  })

  it('renders drag-drop container', () => {
    const wrapper = mount(
      <FileInput />
    );
    const container = wrapper.find('.file-input')
    expect(container.text()).toMatch('Drag & Drop or Click to Upload')
  })

  it('renders the default size limit', () => {
    const wrapper = mount(
      <FileInput />
    );
    const container = wrapper.find('.file-input')
    expect(container.text()).toMatch('Up to 30MB')
  })

  it('renders props.sizeLimit', () => {
    const wrapper = mount(
      <FileInput sizeLimit={10} />
    );
    const container = wrapper.find('.file-input')
    expect(container.text()).toMatch('Up to 10MB')
  })

  it('prompts to replace file if hasImage', () => {
    const wrapper = mount(
      <FileInput hasImage />
    );
    const container = wrapper.find('.file-input')
    expect(container.text()).toMatch('Drag & Drop or Click to Replace')
  })

  it('accepts image files by default', () => {
    const wrapper = mount(
      <FileInput />
    );
    const container = wrapper.find('.file-input')
    expect(container.html()).toMatch('<input type="file" accept=".jpg,.jpeg,.png,.gif">')
  })

  it('accepts video files when video prop is passed', () => {
    const wrapper = mount(
      <FileInput video />
    );
    const container = wrapper.find('.file-input')
    expect(container.html()).toMatch('<input type="file" accept=".jpg,.jpeg,.png,.gif,.mp4">')
  })

  it('calls upload when a file is selected', () => {
    const wrapper = mount(
      <FileInput />
    );
    const file = new Blob([], {type: 'img/jpg'})
    wrapper.find('input').simulate('change', {target: {files: [file]}})
    expect(gemup).toHaveBeenCalled()
  })
})
