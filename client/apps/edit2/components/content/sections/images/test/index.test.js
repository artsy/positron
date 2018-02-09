import { mount, shallow } from 'enzyme'
import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import {
  Artwork,
  Fixtures,
  Image,
  ImageSetPreview,
  ImageSetPreviewClassic
} from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '/client/models/article.coffee'
import Section from '/client/models/section.coffee'
import DragContainer from 'client/components/drag_drop/index.coffee'
import { ProgressBar } from 'client/components/file_input/progress_bar'
import { ImagesControls } from '../components/controls'
import { SectionImages } from '../index.jsx'
require('typeahead.js')

describe('SectionImageCollection', () => {
  let props
  let article

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {}
      },
      edit: {
        article
      }
    })

    return mount(
      <Provider store={store}>
        <SectionImages {...props} />
      </Provider>
    )
  }

  const getShallowWrapper = (props) => {
    return shallow(
      <SectionImages {...props} />
    )
  }

  const imageSection = Fixtures.StandardArticle.sections[4]
  const imageSetSection = Fixtures.StandardArticle.sections[14]
  const largeImageSetSection = Fixtures.StandardArticle.sections[14]
  largeImageSetSection.images.push(Fixtures.StandardArticle.sections[16].images[0])

  beforeEach(() => {
    props = {
      article: {layout: 'standard'},
      editing: false,
      isHero: false,
      section: new Section(imageSection)
    }
  })

  describe('Rendering', () => {
    it('Renders a preview for images/artworks', () => {
      const component = getWrapper(props)

      expect(component.find(Image).length).toBe(2)
      expect(component.find(Artwork).length).toBe(1)
    })

    it('Renders a preview for standard/feature image_set', () => {
      props.section = new Section(imageSetSection)
      const component = getWrapper(props)

      expect(component.find(ImageSetPreview).length).toBe(1)
    })

    it('Renders a preview for classic image_set', () => {
      props.article.layout = 'classic'
      props.section = new Section(imageSetSection)
      const component = getWrapper(props)

      expect(component.find(ImageSetPreviewClassic).length).toBe(1)
    })

    it('Renders controls if editing', () => {
      props.editing = true
      const component = getWrapper(props)

      expect(component.find(ImagesControls).length).toBe(1)
    })

    it('Renders a placeholder if editing and no images', () => {
      props.section.set({images: []})
      const component = getWrapper(props)

      expect(component.text()).toBe('Add images and artworks above')
    })

    it('Renders progress if state.progress', () => {
      props.editing = true
      const component = getShallowWrapper(props)
      component.setState({progress: 0.65})

      expect(component.find(ProgressBar).length).toBe(1)
    })

    describe('Drag/drop', () => {
      it('Does not render draggable components if not editing', () => {
        const component = getWrapper(props)

        expect(component.find(DragContainer).length).toBe(0)
      })

      it('Does not render draggable components if single image', () => {
        props.editing = true
        props.section.set({images: [imageSection.images[0]]})
        const component = getWrapper(props)

        expect(component.find(DragContainer).length).toBe(0)
      })

      it('Renders draggable components if more than one image and editing', () => {
        props.editing = true
        const component = getWrapper(props)

        expect(component.find(DragContainer).length).toBe(1)
      })

      it('#onDragEnd resets the section images and calls #resetDimensions', () => {
        const component = getShallowWrapper(props)
        component.instance().resetDimensions = jest.fn()
        const newImages = props.section.get('images').reverse()

        component.instance().onDragEnd(newImages)
        expect(props.section.get('images')).toBe(newImages)
        expect(component.instance().resetDimensions.mock.calls.length).toBe(1)
      })
    })

    describe('Container sizes', () => {
      it('#getContainerSizes returns sizes for overflow section in standard/feature articles', () => {
        const component = getShallowWrapper(props)
        const sizes = component.instance().getContainerSizes()

        expect(sizes.containerSize).toBe(780)
        expect(sizes.targetHeight).toBe(630)
      })

      it('#getContainerSizes returns sizes for column section in standard/feature articles', () => {
        props.section.set('layout', 'column_width')
        const component = getShallowWrapper(props)
        const sizes = component.instance().getContainerSizes()

        expect(sizes.containerSize).toBe(680)
      })

      it('#getContainerSizes returns sizes for overflow section in classic articles', () => {
        props.article.layout = 'classic'
        const component = getShallowWrapper(props)
        const sizes = component.instance().getContainerSizes()

        expect(sizes.containerSize).toBe(900)
        expect(sizes.targetHeight).toBe(630)
      })

      it('#getContainerSizes returns sizes for column section in classic articles', () => {
        props.article.layout = 'classic'
        props.section.set('layout', 'column_width')
        const component = getShallowWrapper(props)
        const sizes = component.instance().getContainerSizes()

        expect(sizes.containerSize).toBe(580)
      })

      it('#getContainerSizes returns correct sizes for large image_sets in standard/feature articles', () => {
        props.section = new Section(largeImageSetSection)
        const component = getShallowWrapper(props)
        const sizes = component.instance().getContainerSizes()

        expect(sizes.containerSize).toBe(680)
        expect(sizes.targetHeight).toBe(400)
      })

      it('#getContainerSizes returns correct sizes for large image_sets in classic articles', () => {
        props.article.layout = 'classic'
        props.section = new Section(largeImageSetSection)
        const component = getShallowWrapper(props)
        const sizes = component.instance().getContainerSizes()

        expect(sizes.containerSize).toBe(580)
        expect(sizes.targetHeight).toBe(400)
      })
    })

    describe('Fillwidth', () => {
      it('#setFillWidthDimensions returns an array of image sizes', () => {
        const component = getShallowWrapper(props)
        const sizes = component.instance().setFillWidthDimensions()

        expect(sizes.length).toBe(props.section.get('images').length)
        expect(sizes[0].width).toBe(287)
        expect(sizes[0].height).toBe(383)
      })

      it('#getFillWidthDimensions returns state.dimensions', () => {
        const component = getShallowWrapper(props)
        const sizes = component.instance().getFillWidthDimensions()

        expect(sizes.length).toBe(props.section.get('images').length)
        expect(sizes[0].width).toBe(287)
        expect(sizes[0].height).toBe(383)
      })

      it('#getFillWidthDimensions returns false if section layout is column', () => {
        props.section.set('layout', 'column_width')
        const component = getShallowWrapper(props)
        const sizes = component.instance().getFillWidthDimensions()

        expect(sizes).toBe(false)
      })
    })
  })

  it('#removeImage resets the section images', () => {
    const component = getShallowWrapper(props)
    component.instance().removeImage(props.section.get('images')[1])

    expect(props.section.get('images').length).toBe(imageSection.images.length - 1)
    expect(props.section.get('images')[1].url).not.toBe(imageSection.images[1].url)
  })
})
