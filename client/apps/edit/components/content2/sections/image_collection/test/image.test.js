import React from 'react'
import Image from '../components/image.jsx'
import { mount, shallow } from 'enzyme'
import Backbone from 'backbone'

describe('Image', () => {

  const props = {
    image: {
      caption: '<p>Cai Guo-Qiang, <em>Sky Ladder</em>, June 2015. Courtesy of Cai Studio.</p>',
      height: 616,
      type: 'image',
      url: 'https://artsy-media-uploads.s3.amazonaws.com/g_1Kjl.jpg',
      width: 1200
    },
    article: new Backbone.Model({layout: 'standard'}),
    index: 0,
    imagesLoaded: true,
    dimensions: [{width: 200}],
    removeItem: jest.fn()
  }

  beforeAll(() => {
    global.window.$ = jest.fn()
  })

  it('renders the image', () => {
    const wrapper = shallow(
      <Image {...props} />
    )
    expect(wrapper.html()).toMatch('class="image-collection__img-container" style="width:200px;opacity:1;"')
    expect(wrapper.html()).toMatch(
      'src="https://d7hftxdivxxvm.cloudfront.net?resize_to=width&amp;src=https%3A%2F%2Fartsy-'
      )
    expect(wrapper.html()).toMatch('alt="Cai Guo-Qiang, Sky Ladder, June 2015. Courtesy of Cai Studio."')
  })

  it('renders an editable caption with placeholder', () => {
    const wrapper = shallow(
      <Image {...props} />
    )
    expect(wrapper.html()).toMatch('<div class="rich-text--paragraph">')
    expect(wrapper.html()).toMatch('class="public-DraftEditorPlaceholder-root"')
  })

  it('hides the remove button when not editing', () => {
    const wrapper = mount(
      <Image {...props} />
    )
    expect(wrapper.html()).not.toMatch('<div class="edit-section__remove">')
  })

  it('renders the remove button if editing and props.removeItem', () => {
    props.editing = true
    const wrapper = mount(
      <Image {...props} />
    )
    expect(wrapper.html()).toMatch('<div class="edit-section__remove">')
    expect(wrapper.html()).toMatch('<svg id="remove"')
  })

  it('calls removeItem when clicking remove icon', () => {
    props.editing = true
    const wrapper = mount(
      <Image {...props} />
    )
    wrapper.find('.edit-section__remove').simulate('click')
    expect(props.removeItem).toBeCalled()
  })
})
