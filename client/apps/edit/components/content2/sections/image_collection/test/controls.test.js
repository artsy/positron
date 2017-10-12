import React from 'react'
import Backbone from 'backbone'
import components from '@artsy/reaction-force/dist/Components/Publishing/index'
import Controls from '../components/controls.jsx'
import SectionControls from '../../../section_controls/index.jsx'
import sinon from 'sinon'
import { extend } from 'lodash'
import { mount, shallow } from 'enzyme'
const { StandardArticle } = components.Fixtures
require('typeahead.js')

describe('ImageCollectionControls', () => {

  const props = {
    article: new Backbone.Model(StandardArticle),
    channel: {
      hasFeature: sinon.stub().returns(true),
      isEditorial: sinon.stub().returns(true)
    },
    editing: true,
    onChange: jest.fn(),
    images: StandardArticle.sections[4].images,
    section: new Backbone.Model(StandardArticle.sections[4]),
    setProgress: jest.fn()
  }

  beforeAll(() => {
    Backbone.sync = jest.fn()
    SectionControls.prototype.isScrollingOver = sinon.stub().returns(true)
    SectionControls.prototype.isScrolledPast = sinon.stub().returns(false)
    Controls.prototype.fillwidthAlert = sinon.stub()
  })

  it('renders all fields', () => {
    const component = mount(
      <Controls {...props} />
    )
    expect(component.find(SectionControls).length).toBe(1)
    expect(component.html()).toMatch('overflow_fillwidth')
    expect(component.html()).toMatch('<a name="overflow_fillwidth" class="layout" data-active="true">')
    expect(component.html()).toMatch('column_width')
    expect(component.html()).toMatch('fillwidth')
    expect(component.html()).toMatch('image_set')
    expect(component.html()).toMatch('<input type="file"')
    expect(component.html()).toMatch('placeholder="Search for artwork by title"')
    expect(component.html()).toMatch('placeholder="Add artwork url"')
  })

  it('does not display artwork inputs or layouts if heroSection', () => {
    props.isHero = true
    const component = mount(
      <Controls {...props} />
    )
    expect(component.html()).not.toMatch('class="layout"')
    expect(component.html()).not.toMatch('placeholder="Search for artwork by title"')
    expect(component.html()).not.toMatch('placeholder="Add artwork url"')
  })

  describe('Artwork inputs', () => {
    it('#onUpload saves an image info after upload', () => {
      props.isHero = false
      const component = mount(
        <Controls {...props} />
      )
      component.instance().onUpload('http://image.jpg', 400, 800)
      expect(component.instance().props.section.get('images')[3].type).toMatch('image')
      expect(component.instance().props.section.get('images')[3].url).toMatch('http://image.jpg')
      expect(component.instance().props.section.get('images')[3].width).toBe(400)
      expect(component.instance().props.section.get('images')[3].height).toBe(800)
    })

    it('saves an artwork by url', () => {
      const artwork = StandardArticle.sections[4].images[2]
      const newArtwork = extend(artwork, {images: [{
        image_url: "/local/additional_images/4e7cb83e1c80dd00010038e2/1/:version.jpg",
        image_versions: ['small', 'square', 'medium', 'large', 'larger', 'best', 'normalized'],
        original_height: 585,
        original_width: 1000 }]
      })
      props.section.set('images', [])
      props.images = []
      const component = mount(
        <Controls {...props} />
      )
      const input = component.find('.bordered-input').at(0)

      input.simulate('change', { target: { value: 'http://artsy.net' } })
      component.find('.avant-garde-button').at(0).simulate('click')
      Backbone.sync.mock.calls[0][2].success(newArtwork)
      expect(props.section.get('images')[0].type).toMatch('artwork')
      expect(props.section.get('images')[0].image).toMatch(
        '/local/additional_images/4e7cb83e1c80dd00010038e2/1/larger.jpg'
      )
    })

    it('#addArtworkFromUrl updates the section images', () => {
      const component = mount(
        <Controls {...props} />
      )
      component.instance().addArtworkFromUrl([
        {type:'image', url:'image.com'},
        {type: 'artwork', image:'artwork.jpg'}
      ])
      expect(component.instance().props.section.get('images')[0].url).toMatch('image.com')
      expect(component.instance().props.section.get('images')[1].image).toMatch('artwork.jpg')
    })

    it('#inputsAreDisabled returns false if layout is not fillwidth', () => {
      const component = mount(
        <Controls {...props} />
      )
      const inputsAreDisabled = component.instance().inputsAreDisabled(props.section)
      expect(inputsAreDisabled).toBe(false)
    })

    it('#inputsAreDisabled returns true if fillwidth section has images', () => {
      props.section.set({layout: 'fillwidth'})
      const component = mount(
        <Controls {...props} />
      )
      const inputsAreDisabled = component.instance().inputsAreDisabled(props.section)
      expect(inputsAreDisabled).toBe(true)
    })

    it('Calls #fillwidthAlert if inputsAreDisabled and trying to add an image', () => {
      const component = mount(
        <Controls {...props} />
      )
      component.find('.edit-controls__artwork-inputs').simulate('click')
      expect(Controls.prototype.fillwidthAlert.called).toBe(true)
    })
  })

  describe('Image Set inputs', () => {
    it('Renders the active image_set layout', () => {
      props.section.set({type: 'image_set', layout: 'mini'})
      const component = shallow(
        <Controls {...props} />
      )
      expect(component.html()).toMatch(
        '<div class="input-group"><div class="radio-input" data-active="true"></div>Mini</div>'
      )
    })

    it('changes imageset layout on button click', () => {
      props.section.set({type: 'image_set', layout: 'mini'})
      const component = shallow(
        <Controls {...props} />
      )
      component.find('.radio-input').at(1).simulate('click')
      expect(props.section.get('layout')).toMatch('full')
    })

    it('changes imageset title on input', () => {
      const component = mount(
        <Controls {...props} />
      )
      const input = component.ref('title')
      input.simulate('change', { target: { value: 'A title for the Image Set' } })
      expect(props.section.get('title')).toMatch('A title for the Image Set')
    })
  })
})
