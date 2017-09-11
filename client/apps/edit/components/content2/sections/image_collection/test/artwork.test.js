import React from 'react'
import Artwork from '../components/artwork.jsx'
import { mount, shallow } from 'enzyme'
import Backbone from 'backbone'

describe('Artwork', () => {

  const props = {
    artwork: {
      date: '2015',
      height: 3000,
      id: '5638bd92726169641200003b',
      image: 'https://d32dm0rphc51dk.cloudfront.net/OBKPvGFAx1qgakm5x7ik0Q/larger.jpg',
      artists: [ {name: 'Gerald Machona', slug:'gerald-machona'} ],
      partner: {name: 'Goodman Gallery', slug: 'goodman-gallery'},
      slug: 'gerald-machona-keep-calm-and-unti-the-noose-i',
      title: 'Keep calm and unti the noose I',
      type:'artwork',
      width: 2002
    },
    article: new Backbone.Model({layout: 'standard'}),
    index: 0,
    imagesLoaded: true,
    dimensions: [{width: 200}],
    removeItem: jest.fn()
  }

  it('renders the artwork', () => {
    const wrapper = shallow(
      <Artwork {...props} />
    )
    expect(wrapper.html()).toMatch('class="image-collection__img-container" style="width:200px;opacity:1;"')
    expect(wrapper.html()).toMatch(
      'src="https://d7hftxdivxxvm.cloudfront.net?resize_to=width&amp;src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FOBKPvGFAx1qgakm5x7ik0Q%2Flarger.jpg&amp;width=1200&amp;quality=95'
      )
    expect(wrapper.html()).toMatch('<span class="name">Gerald Machona</span>')
    expect(wrapper.html()).toMatch('<em>Keep calm and unti the noose I</em>')
    expect(wrapper.html()).toMatch('<span class="date">2015</span>')
    expect(wrapper.html()).toMatch(', </span>Goodman Gallery')
  })

  it('hides the remove button when not editing', () => {
    const wrapper = mount(
      <Artwork {...props} />
    )
    expect(wrapper.html()).not.toMatch('<div class="edit-section__remove">')
  })

  it('renders the remove button if editing and props.removeItem', () => {
    props.editing = true
    const wrapper = mount(
      <Artwork {...props} />
    )
    expect(wrapper.html()).toMatch('<div class="edit-section__remove">')
    expect(wrapper.html()).toMatch('<svg id="remove"')
  })

  it('calls removeItem when clicking remove icon', () => {
    props.editing = true
    const wrapper = mount(
      <Artwork {...props} />
    )
    wrapper.find('.edit-section__remove').simulate('click')
    expect(props.removeItem).toBeCalled()
  })
})
