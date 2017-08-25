import React from 'react';
import Video from '../index.jsx';
import { mount, shallow } from 'enzyme';
import Backbone from 'Backbone'

describe('Video', () => {
  beforeAll(() => {
    global.window.$ = jest.fn()
    global.window.$.ajax = jest.fn()
  })

  it('renders a placeholder', () => {
    const props = {
      section: new Backbone.Model(),
      article: new Backbone.Model({layout: 'standard'}),
      channel: new Backbone.Model()
    }
    const wrapper = shallow(
      <Video {...props} />
    );
    const container = wrapper
    expect(container.html()).toMatch('edit-section__placeholder')
    expect(container.text()).toMatch('Add a video above')
  })
  it('renders a saved video and cover image', () => {
    const props = {
      section: new Backbone.Model({
        type: 'video',
        url: 'https://youtu.be/Bv_5Zv5c-Ts',
        cover_image_url: 'http://image.jpg'
      }),
      article: new Backbone.Model({layout: 'standard'}),
      channel: new Backbone.Model()
    }
    const wrapper = mount(
      <Video {...props} />
    );
    const container = wrapper
    expect(wrapper.children().nodes[0].props.section.url).toMatch('https://youtu.be/Bv_5Zv5c-Ts')
    expect(wrapper.children().nodes[0].props.section.cover_image_url).toMatch('http://image.jpg')
    expect(container.html()).not.toMatch('edit-section__placeholder')
    expect(container.text()).not.toMatch('Add a video above')
  })
})
