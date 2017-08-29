import React from 'react'
import Video from '../index.jsx'
import { mount, shallow } from 'enzyme'
import Backbone from 'backbone'

describe('Video', () => {

  const props = {
    section: new Backbone.Model({
      type: 'video',
      url: '',
      cover_image_url: 'http://image.jpg',
      caption: 'A video caption.'
    }),
    article: new Backbone.Model({layout: 'standard'}),
    channel: new Backbone.Model()
  }

  beforeAll(() => {
    global.window.$ = jest.fn()
    global.window.$.ajax = jest.fn()
  })

  it('renders a placeholder', () => {
    const wrapper = shallow(
      <Video {...props} />
    )
    expect(wrapper.html()).toMatch('edit-section__placeholder')
    expect(wrapper.text()).toMatch('Add a video above')
  })

  it('renders a saved video and cover image', () => {
    props.section.set('url', 'https://youtu.be/Bv_5Zv5c-Ts')
    const wrapper = mount(
      <Video {...props} />
    )
    expect(wrapper.children().nodes[0].props.section.url).toMatch('https://youtu.be/Bv_5Zv5c-Ts')
    expect(wrapper.children().nodes[0].props.section.cover_image_url).toMatch('http://image.jpg')
    expect(wrapper.html()).not.toMatch('edit-section__placeholder')
    expect(wrapper.text()).not.toMatch('Add a video above')
  })

  it('renders the section controls when editing', () => {
    props.editing = true
    const wrapper = mount(
      <Video {...props} />
    )
    expect(wrapper.html()).toMatch('<header class="edit-controls"')
    expect(wrapper.find('a.layout').length).toEqual(2)
    expect(wrapper.html()).toMatch('<div class="file-input">')
    expect(wrapper.html()).toMatch('placeholder="Paste a youtube or vimeo url')
  })

  it('renders fullscreen controls if article is feature', () => {
    props.editing = true
    props.article.set('layout', 'feature')
    const wrapper = mount(
      <Video {...props} />
    )
    expect(wrapper.find('a.layout').length).toEqual(3)
  })


  it('renders cover remove button if editing and has cover_image_url', () => {
    props.editing = true
    props.section.set('url', 'https://youtu.be/Bv_5Zv5c-Ts')
    const wrapper = mount(
      <Video {...props} />
    )
    expect(wrapper.children().nodes[1].props.children[0].props.className).toMatch('edit-section__remove')
  })

  it('#onRemoveImage removes the cover_image_url', () => {
    const wrapper = mount(
      <Video {...props} />
    )
    wrapper.instance().onRemoveImage()
    expect(wrapper.props().section.get('cover_image_url')).toBeFalsy()
  })

  it('#onProgress sets state.progress and renders progress container if state.propgress is not null', () => {
    props.editing = true
    const wrapper = mount(
      <Video {...props} />
    )
    wrapper.instance().onProgress(.5)
    expect(wrapper.state().progress).toEqual(.5)
    expect(wrapper.html()).toMatch('<div class="upload-progress" style="width: 50%;">')
  })

  it('#onClickOff destroys the section if no video url', () => {
    props.section.set('url', '')
    const spy = jest.spyOn(props.section, 'destroy')
    const wrapper = mount(
      <Video {...props} />
    )
    wrapper.instance().onClickOff()
    expect(spy).toHaveBeenCalled()
  })

})
