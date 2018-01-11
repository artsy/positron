import Backbone from 'backbone'
import React from 'react'
import { mount } from 'enzyme'
import { SectionVideo } from '../index.jsx'

describe('Video', () => {
  let props

  beforeEach(() => {
    props = {
      section: new Backbone.Model({
        type: 'video',
        url: 'http://some-url.com',
        cover_image_url: 'http://image.jpg',
        caption: 'A video caption.'
      }),
      article: new Backbone.Model({layout: 'standard'}),
      channel: new Backbone.Model()
    }
  })

  beforeAll(() => {
    global.window.$ = jest.fn()
    global.window.$.ajax = jest.fn()
  })

  it('renders a placeholder', () => {
    props.section.set('url', null)
    const component = mount(
      <SectionVideo {...props} />
    )
    expect(component.html()).toMatch('edit-section__placeholder')
    expect(component.text()).toMatch('Add a video above')
  })

  it('renders a saved video and cover image', () => {
    props.section.set('url', 'https://youtu.be/Bv_5Zv5c-Ts')
    const component = mount(
      <SectionVideo {...props} />
    )
    expect(component.props().section.toJSON().url).toMatch('https://youtu.be/Bv_5Zv5c-Ts')
    expect(component.props().section.toJSON().cover_image_url).toMatch('http://image.jpg')
    expect(component.html()).not.toMatch('edit-section__placeholder')
    expect(component.text()).not.toMatch('Add a video above')
  })

  it('renders the section controls when editing', () => {
    props.editing = true
    const component = mount(
      <SectionVideo {...props} />
    )
    expect(component.html()).toMatch('<div class="edit-controls"')
    expect(component.find('a.layout').length).toEqual(2)
    expect(component.html()).toMatch('<div class="file-input">')
    expect(component.html()).toMatch('placeholder="Paste a youtube or vimeo url')
  })

  it('renders fullscreen controls if article is feature', () => {
    props.editing = true
    props.article.set('layout', 'feature')
    const component = mount(
      <SectionVideo {...props} />
    )
    expect(component.find('a.layout').length).toEqual(3)
  })

  it('does not update video url if invalid', () => {
    props.editing = true
    const component = mount(
      <SectionVideo {...props} />
    )
    const input = component.find('.bordered-input')
    input.simulate('change', { target: { value: undefined } })
    expect(props.section.get('url', props.section.get('url')))
    input.simulate('change', { target: { value: 'invalid url' } })
    expect(component.props().section.get('url')).toEqual(props.section.get('url'))
  })

  it('updates video url if valid', () => {
    props.editing = true
    const component = mount(
      <SectionVideo {...props} />
    )
    const input = component.find('.bordered-input')
    const validUrls = [
      'http://hello.com',
      'https://www.how.com',
      'http://are.you'
    ]
    validUrls.forEach(value => {
      input.instance().value = value
      input.simulate('change', { target: {value} })
      expect(component.props().section.get('url')).toEqual(value)
    })
  })

  it('renders cover remove button if editing and has cover_image_url', () => {
    props.editing = true
    props.section.set('url', 'https://youtu.be/Bv_5Zv5c-Ts')
    const component = mount(
      <SectionVideo {...props} />
    )
    expect(component.find('.edit-section__remove').length).toEqual(1)
  })

  it('can remove the cover_image_url', () => {
    props.editing = true
    const component = mount(
      <SectionVideo {...props} />
    )
    component.find('.edit-section__remove').simulate('click')
    expect(component.props().section.get('cover_image_url')).toBeFalsy()
  })

  it('resets the cover url if video url is empty', () => {
    props.editing = true
    const component = mount(
      <SectionVideo {...props} />
    )
    const input = component.find('.bordered-input')
    input.instance().value = ''
    input.simulate('change', { target: { value: '' } })
    expect(component.props().section.get('url')).toBeFalsy()
    expect(component.props().section.get('cover_image_url')).toBeFalsy()
  })

  it('#onProgress sets state.progress and renders progress container if state.progress is not null', () => {
    props.editing = true
    const component = mount(
      <SectionVideo {...props} />
    )
    component.instance().onProgress(.5)
    expect(component.state().progress).toEqual(.5)
    expect(component.html()).toMatch('<div class="upload-progress" style="width: 50%;">')
  })

  it('#onClickOff destroys the section if no video url', () => {
    props.section.set('url', '')
    const spy = jest.spyOn(props.section, 'destroy')
    const component = mount(
      <SectionVideo {...props} />
    )
    component.instance().onClickOff()
    expect(spy).toHaveBeenCalled()
  })

})
