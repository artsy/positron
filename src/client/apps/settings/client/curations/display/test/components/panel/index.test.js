import React from 'react'
import { Panel } from '../../../components/panel'
import { mount } from 'enzyme'
import { CharacterLimit } from 'client/components/character_limit'
import { Paragraph } from 'client/components/draft/paragraph/paragraph'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

global.window.getSelection = jest.fn(() => {
  return {
    isCollapsed: true,
    getRangeAt: jest.fn()
  }
})

describe('Panel', () => {
  let props = {}

  beforeEach(() => {
    props = {
      campaign: {
        canvas: {},
        panel: {}
      },
      index: 0,
      onChange: jest.fn()
    }
  })

  it('renders all fields', () => {
    const component = mount(
      <Panel {...props} />
    )
    expect(component.find('input').length).toBe(5)
    expect(component.find(CharacterLimit).length).toBe(2)
    expect(component.find(ImageUpload).length).toBe(2)
    expect(component.find('label').at(0).text()).toMatch('Headline')
    expect(component.find('label').at(0).text()).toMatch('25 Characters')
    expect(component.find('label').at(2).text()).toMatch('Body')
    expect(component.find('label').at(2).text()).toMatch('45 Characters')
    expect(component.find('label').at(3).text()).toMatch('Pixel Tracking Code (optional)')
  })

  it('renders saved text data', () => {
    props.campaign.panel = {
      assets: [{ url: 'http://artsy.net/image.jpg' }],
      body: '<p>Sample body text. <a href="http://artsy.net">Example link</a>.',
      headline: 'Sample Headline',
      link: { url: 'http://artsy.net' },
      logo: 'http://artsy.net/logo.jpg',
      pixel_tracking_code: 'pixel tracking code'
    }
    const component = mount(
      <Panel {...props} />
    )

    expect(component.find('label').at(0).text()).toMatch('10 Characters')
    expect(component.find('input').at(0).instance().value).toMatch(props.campaign.panel.headline)
    expect(component.find('input').at(1).instance().value).toMatch(props.campaign.panel.link.url)
    expect(component.find(Paragraph).at(0).text()).toMatch('Sample body text.')
    expect(component.find(Paragraph).at(0).text()).toMatch('Example link')
    expect(component.find(Paragraph).at(0).html()).toMatch('<a href="http://artsy.net/">')
    expect(component.find('input').at(2).instance().value).toMatch(props.campaign.panel.pixel_tracking_code)
  })

  it('Calls props.onChange on headline change', () => {
    const component = mount(
      <Panel {...props} />
    )
    component.find('input').at(0).simulate('change', { target: { value: 'New Headline' } })
    expect(props.onChange.mock.calls[0][0]).toMatch('panel.headline')
    expect(props.onChange.mock.calls[0][1]).toMatch('New Headline')
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it('Calls props.onChange on CTA link change', () => {
    const component = mount(
      <Panel {...props} />
    )
    component.find('input').at(1).simulate('change', { target: { value: 'http://new-link.com' } })
    expect(props.onChange.mock.calls[0][0]).toMatch('panel.link.url')
    expect(props.onChange.mock.calls[0][1]).toMatch('http://new-link.com')
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it('Calls props.onChange on pixel_tracking_code change', () => {
    const component = mount(
      <Panel {...props} />
    )
    component.find('input').at(2).simulate('change', { target: { value: 'new tracking code' } })
    expect(props.onChange.mock.calls[0][0]).toMatch('panel.pixel_tracking_code')
    expect(props.onChange.mock.calls[0][1]).toMatch('new tracking code')
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })

  it('Calls props.onChange on body change', () => {
    const component = mount(
      <Panel {...props} />
    )
    component.find(CharacterLimit).at(1).instance().onChange('new value')
    expect(props.onChange.mock.calls[0][0]).toMatch('panel.body')
    expect(props.onChange.mock.calls[0][1]).toMatch('new value')
    expect(props.onChange.mock.calls[0][2]).toBe(props.index)
  })
})
