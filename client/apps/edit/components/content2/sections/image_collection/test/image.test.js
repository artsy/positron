import React from 'react'
import Backbone from 'backbone'
import components from '@artsy/reaction-force/dist/components/publishing/index'
import Image from '../components/image.jsx'
import { mount } from 'enzyme'
const { StandardArticle } = components.Fixtures

describe('Image', () => {

  const props = {
    image: StandardArticle.sections[4].images[0],
    article: new Backbone.Model(StandardArticle),
    section: new Backbone.Model(StandardArticle.sections[4]),
    index: 0,
    imagesLoaded: true,
    width: 200,
    removeItem: jest.fn()
  }

  it('renders the image', () => {
    const component = mount(
      <Image {...props} />
    )
    expect(component.html()).toMatch(
      'class="image-collection__img-container" style="width: 200px; opacity: 1;"'
    )
    expect(component.html()).toMatch(
      'src="https://d7hftxdivxxvm.cloudfront.net?resize_to=width&amp;src=https%3A%2F%2Fartsy-media-uploads.s3.amazonaws.com%2F5ZP7vKuVPqiynVU0jpFewQ%252Funnamed.png&amp;width=1200&amp;quality=95'
    )
    expect(component.html()).toMatch(
      'alt="John Elisle, The Star, from the reimagined female Tarot cards. Courtesy of the artist.'
    )
  })

  it('renders an editable caption with placeholder', () => {
    props.image.caption = ''
    const component = mount(
      <Image {...props} />
    )
    expect(component.html()).toMatch('<div class="rich-text--paragraph">')
    expect(component.html()).toMatch('class="public-DraftEditorPlaceholder-root"')
  })

  it('hides the remove button when not editing', () => {
    const component = mount(
      <Image {...props} />
    )
    expect(component.html()).not.toMatch('<div class="edit-section__remove">')
  })

  it('renders the remove button if editing and props.removeItem', () => {
    props.editing = true
    const component = mount(
      <Image {...props} />
    )
    expect(component.html()).toMatch('<div class="edit-section__remove">')
    expect(component.html()).toMatch('<svg class="remove"')
  })

  it('calls removeItem when clicking remove icon', () => {
    props.editing = true
    const component = mount(
      <Image {...props} />
    )
    component.find('.edit-section__remove').simulate('click')
    expect(props.removeItem).toBeCalled()
  })
})
