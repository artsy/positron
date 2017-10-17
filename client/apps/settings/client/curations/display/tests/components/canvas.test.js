import React from 'react'
import { Canvas } from '../../components/canvas.jsx'
import { CharacterLimit } from '/client/components/character_limit'
import { PlainText } from '/client/components/rich_text2/components/plain_text.jsx'
import { mount } from 'enzyme'
import {
  UnitCanvasImage,
  UnitCanvasOverlay,
  UnitCanvasSlideshow
} from '@artsy/reaction-force/dist/Components/Publishing/Fixtures/Components'

describe('Canvas', () => {
  const props = {
    campaign: {
      canvas: {},
      panel: {}
    },
    index: 0,
    onChange: jest.fn()
  }

  describe('Editing', () => {
    it('Can save an edited headline', () => {
      const component = mount(
        <Canvas {...props} />
      )
      const input = component.find('input').at(0)
      input.simulate('change', { target: { value: 'New Headline' } })

      expect(props.onChange.mock.calls[0][0]).toMatch('canvas.headline')
      expect(props.onChange.mock.calls[0][1]).toMatch('New Headline')
      expect(props.onChange.mock.calls[0][2]).toBe(0)
    })

    it('Can save an edited overlay body', () => {
      props.campaign.canvas.layout = 'overlay'
      const component = mount(
        <Canvas {...props} />
      )
      component.find(PlainText).at(0).node.props.onChange('New Body')
      expect(props.onChange.mock.calls[1][0]).toMatch('canvas.headline')
      expect(props.onChange.mock.calls[1][1]).toMatch('New Body')
      expect(props.onChange.mock.calls[1][2]).toBe(0)
    })

    it('Can save an edited CTA Text', () => {
      const component = mount(
        <Canvas {...props} />
      )
      const input = component.find('input').at(0)
      input.simulate('change', { target: { value: 'Read More' } })

      expect(props.onChange.mock.calls[2][0]).toMatch('canvas.link.text')
      expect(props.onChange.mock.calls[2][1]).toMatch('Read More')
      expect(props.onChange.mock.calls[2][2]).toBe(0)
    })

    it('Can save an edited CTA Link', () => {
      const component = mount(
        <Canvas {...props} />
      )
      const input = component.find('input').at(1)
      input.simulate('change', { target: { value: 'http://artsy.net' } })

      expect(props.onChange.mock.calls[3][0]).toMatch('canvas.link.url')
      expect(props.onChange.mock.calls[3][1]).toMatch('http://artsy.net')
      expect(props.onChange.mock.calls[3][2]).toBe(0)
    })

    it('Can save an edited Disclaimer', () => {
      const component = mount(
        <Canvas {...props} />
      )
      component.find(PlainText).at(1).node.props.onChange('New Disclaimer')
      expect(props.onChange.mock.calls[4][0]).toMatch('canvas.disclaimer')
      expect(props.onChange.mock.calls[4][1]).toMatch('New Disclaimer')
      expect(props.onChange.mock.calls[4][2]).toBe(0)
    })
  })

  describe('Overlay', () => {
    it('Renders all fields', () => {
      props.campaign.canvas = UnitCanvasOverlay
      const component = mount(
        <Canvas {...props} />
      )
      expect(component.find(CharacterLimit).length).toBe(3)
      expect(component.find('input[type="file"]').length).toBe(2)
      expect(component.text()).toMatch('Body')
      expect(component.text()).toMatch('CTA Text')
      expect(component.text()).toMatch('CTA Link')
      expect(component.text()).toMatch('Disclaimer (optional)')
      expect(component.text()).toMatch('Background Image')
      expect(component.text()).toMatch('Logo')
    })

    it('Renders saved data', () => {
      const component = mount(
        <Canvas {...props} />
      )
      expect(component.text()).toMatch(props.campaign.canvas.headline)
      expect(component.html()).toMatch(props.campaign.canvas.link.text)
      expect(component.html()).toMatch(props.campaign.canvas.link.url)
      expect(component.text()).toMatch(props.campaign.canvas.disclaimer)
      expect(component.html()).toMatch(props.campaign.canvas.logo)
      expect(component.html()).toMatch(props.campaign.canvas.assets[0].url)
    })
  })

  describe('Standard', () => {
    it('Renders all fields', () => {
      props.campaign.canvas = UnitCanvasImage
      const component = mount(
        <Canvas {...props} />
      )
      expect(component.find(CharacterLimit).length).toBe(3)
      expect(component.find('input[type="file"]').length).toBe(2)
      expect(component.html()).toMatch('accept="image/jpg,image/jpeg,image/gif,image/png,video/mp4"')
      expect(component.text()).toMatch('Headline')
      expect(component.text()).toMatch('CTA Text')
      expect(component.text()).toMatch('CTA Link')
      expect(component.text()).toMatch('Disclaimer (optional)')
      expect(component.text()).toMatch('Image / Video')
      expect(component.text()).toMatch('Logo')
    })

    it('Renders saved data', () => {
      const component = mount(
        <Canvas {...props} />
      )
      expect(component.html()).toMatch(props.campaign.canvas.headline)
      expect(component.html()).toMatch(props.campaign.canvas.link.text)
      expect(component.html()).toMatch(props.campaign.canvas.link.url)
      expect(component.text()).toMatch(props.campaign.canvas.disclaimer)
      expect(component.html()).toMatch(props.campaign.canvas.logo)
      expect(component.html()).toMatch(props.campaign.canvas.assets[0].url)
    })

    it('Can render a video file', () => {
      props.campaign.canvas.assets[0].url = 'http://video.mp4'
      const component = mount(
        <Canvas {...props} />
      )
      expect(component.html()).toMatch('<video src="http://video.mp4">')
    })
  })

  describe('Slideshow', () => {
    it('Renders all fields', () => {
      props.campaign.canvas = UnitCanvasSlideshow
      const component = mount(
        <Canvas {...props} />
      )
      expect(component.find(CharacterLimit).length).toBe(3)
      expect(component.find('input[type="file"]').length).toBe(6)
      expect(component.text()).toMatch('Headline')
      expect(component.text()).toMatch('CTA Text')
      expect(component.text()).toMatch('CTA Link')
      expect(component.text()).toMatch('Disclaimer (optional)')
      expect(component.text()).toMatch('Image 1')
      expect(component.text()).toMatch('Image 2')
      expect(component.text()).toMatch('Logo')
    })

    it('Renders saved data', () => {
      const component = mount(
        <Canvas {...props} />
      )
      expect(component.html()).toMatch(props.campaign.canvas.headline)
      expect(component.html()).toMatch(props.campaign.canvas.link.text)
      expect(component.html()).toMatch(props.campaign.canvas.link.url)
      expect(component.text()).toMatch(props.campaign.canvas.disclaimer)
      expect(component.html()).toMatch(props.campaign.canvas.logo)
      expect(component.html()).toMatch(props.campaign.canvas.assets[0].url)
      expect(component.html()).toMatch(props.campaign.canvas.assets[1].url)
    })
  })
})
