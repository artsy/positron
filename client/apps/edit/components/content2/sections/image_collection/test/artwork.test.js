import React from 'react'
import Artwork from '../components/artwork.jsx'
import Backbone from 'backbone'
import components from '@artsy/reaction-force/dist/Components/Publishing/index'
import { extend } from 'lodash'
import { mount } from 'enzyme'
const { StandardArticle } = components.Fixtures

describe('Artwork', () => {
  const props = {
    artwork: extend(StandardArticle.sections[4].images[2], {date: '2015'}),
    article: new Backbone.Model(StandardArticle),
    section: new Backbone.Model(StandardArticle.sections[4]),
    index: 0,
    imagesLoaded: true,
    width: 200,
    removeItem: jest.fn()
  }

  it('renders the artwork', () => {
    const component = mount(
      <Artwork {...props} />
    )
    expect(component.html()).toMatch(
      'class="image-collection__img-container" style="width: 200px; opacity: 1;"'
    )
    expect(component.html()).toMatch(
      'src="https://d7hftxdivxxvm.cloudfront.net?resize_to=width&amp;src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FlSBz0tsfvOAm2qKdWwgxLw%2Flarger.jpg&amp;width=1200&amp;quality=95'
    )
    expect(component.html()).toMatch('<span class="name">Matt Devine</span>')
    expect(component.html()).toMatch('Brass Tax')
    expect(component.html()).toMatch('<span class="date">2015</span>')
    expect(component.text()).toMatch(', Joanne Artman Gallery')
  })

  it('hides the remove button when not editing', () => {
    const component = mount(
      <Artwork {...props} />
    )
    expect(component.html()).not.toMatch('<div class="edit-section__remove">')
  })

  it('renders the remove button if editing and props.removeItem', () => {
    props.editing = true
    const component = mount(
      <Artwork {...props} />
    )
    expect(component.html()).toMatch('<div class="edit-section__remove">')
    expect(component.html()).toMatch('<svg class="remove"')
  })

  it('calls removeItem when clicking remove icon', () => {
    props.editing = true
    const component = mount(
      <Artwork {...props} />
    )
    component.find('.edit-section__remove').simulate('click')
    expect(props.removeItem).toBeCalled()
  })
})
