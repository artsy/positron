import { mount } from 'enzyme'
import React from 'react'
import Backbone from 'backbone'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Artwork from '../../../../../../../models/artwork.coffee'
import SectionControls from '../../../section_controls'
import { ImageCollectionControls } from '../components/controls'
const { StandardArticle } = Fixtures
require('typeahead.js')

describe('ImageCollectionControls', () => {
  let props
  const artwork = StandardArticle.sections[4].images[2]

  const getWrapper = (props) => {
    return mount(
      <ImageCollectionControls {...props} />
    )
  }

  beforeEach(() => {
    props = {
      articleLayout: 'standard',
      channel: {
        hasFeature: jest.fn().mockReturnValue(true),
        isArtsyChannel: jest.fn().mockReturnValue(true)
      },
      logErrorAction: jest.fn(),
      section: new Backbone.Model(StandardArticle.sections[4]),
      setProgress: jest.fn()
    }

    SectionControls.prototype.isScrollingOver = jest.fn().mockReturnValue(true)
    SectionControls.prototype.isScrolledPast = jest.fn().mockReturnValue(false)
    Artwork.prototype.denormalized = jest.fn().mockReturnValue(artwork)
  })

  it('renders all fields', () => {
    const component = getWrapper(props)

    expect(component.find(SectionControls).length).toBe(1)
    expect(component.html()).toMatch('overflow_fillwidth')
    expect(component.html()).toMatch('<a name="overflow_fillwidth" class="layout" data-active="true">')
    expect(component.html()).toMatch('column_width')
    expect(component.html()).toMatch('fillwidth')
    expect(component.html()).toMatch('image_set')
    expect(component.html()).toMatch('<input type="file"')
    expect(component.html()).toMatch('placeholder="Search artworks by title..."')
    expect(component.html()).toMatch('placeholder="Add artwork url"')
  })

  it('does not display artwork inputs or layouts if heroSection', () => {
    props.isHero = true
    const component = getWrapper(props)

    expect(component.html()).not.toMatch('class="layout"')
    expect(component.html()).not.toMatch('placeholder="Search for artwork by title"')
    expect(component.html()).not.toMatch('placeholder="Add artwork url"')
  })

  it('#componentWillUnmount destroys section on unmount if no images', () => {
    props.section.set('images', [])
    const spy = jest.spyOn(props.section, 'destroy')
    const component = getWrapper(props)

    component.instance().componentWillUnmount()
    expect(spy).toHaveBeenCalled()
  })

  describe('Artwork inputs', () => {
    it('#onUpload saves an image info after upload', () => {
      props.isHero = false
      const component = getWrapper(props)

      component.instance().onUpload('http://image.jpg', 400, 800)
      expect(component.instance().props.section.get('images')[3].type).toMatch('image')
      expect(component.instance().props.section.get('images')[3].url).toMatch('http://image.jpg')
      expect(component.instance().props.section.get('images')[3].width).toBe(400)
      expect(component.instance().props.section.get('images')[3].height).toBe(800)
    })

    xit('saves an artwork by url', async () => {
      Backbone.sync = jest.fn(() => {
        return artwork
      })

      props.section.set('images', [])
      const component = getWrapper(props)
      const input = component.find('.bordered-input').at(1)

      input.simulate('change', { target: { value: 'http://artsy.net/artwork/cool-art' } })
      component.find('.avant-garde-button').at(0).simulate('click')
      await Backbone.sync.mock.calls[0][2].success(artwork)

      // expect(props.section.get('images')[0].get('type')).toMatch('artwork')
    })

    it('#onNewImage updates the section images', () => {
      const component = getWrapper(props)

      component.instance().onNewImage(
        {type: 'artwork', image: 'artwork.jpg'}
      )
      expect(props.section.get('images')[3].image).toMatch('artwork.jpg')
    })

    it('#inputsAreDisabled returns false if layout is not fillwidth', () => {
      const component = getWrapper(props)

      const inputsAreDisabled = component.instance().inputsAreDisabled(props.section)
      expect(inputsAreDisabled).toBe(false)
    })

    it('#inputsAreDisabled returns true if fillwidth section has images', () => {
      props.section.set({layout: 'fillwidth'})
      const component = getWrapper(props)

      const inputsAreDisabled = component.instance().inputsAreDisabled(props.section)
      expect(inputsAreDisabled).toBe(true)
    })

    it('Calls #logErrorAction if inputsAreDisabled and trying to add an image', () => {
      props.section.set({layout: 'fillwidth'})
      const component = getWrapper(props)

      component.find('.edit-controls__artwork-inputs').at(0).simulate('click')
      expect(component.props().logErrorAction.mock.calls.length).toBe(1)
    })
  })

  describe('Image Set inputs', () => {
    beforeEach(() => {
      props.section.set({type: 'image_set', layout: 'mini'})
    })

    it('Renders the active image_set layout', () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch(
        '<div class="input-group"><div class="radio-input" data-active="true"></div>Mini</div>'
      )
    })

    it('changes imageset layout on button click', () => {
      const component = getWrapper(props)

      component.find('.radio-input').at(1).simulate('click')
      expect(props.section.get('layout')).toMatch('full')
    })

    it('changes imageset title on input', () => {
      const component = getWrapper(props)
      const input = component.find('.edit-controls__image-set-inputs').find('input')

      input.simulate('change', { target: { value: 'A title for the Image Set' } })
      expect(props.section.get('title')).toMatch('A title for the Image Set')
    })
  })
})
