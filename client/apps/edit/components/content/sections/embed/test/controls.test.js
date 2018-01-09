import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Channel from '/client/models/channel.coffee'
import Section from '/client/models/section.coffee'
import SectionControls from '../../../section_controls/index.jsx'
import { EmbedControls } from '../controls.jsx'

const { StandardArticle } = Fixtures

describe('EmbedControls', () => {
  let props
  SectionControls.prototype.isScrollingOver = jest.fn()
  SectionControls.prototype.isScrolledPast = jest.fn()

  beforeEach(() => {
    props = {
      articleLayout: 'standard',
      channel: new Channel(),
      section: new Section(StandardArticle.sections[10])
    }
  })

  describe('Section Layouts', () => {
    it('Renders the inputs', () => {
      const component = mount(
        <EmbedControls {...props} />
      )
      expect(component.find(SectionControls).length).toBe(1)
      expect(component.find('input').length).toBe(3)
    })

    it('Renders saved data', () => {
      const component = mount(
        <EmbedControls {...props} />
      )
      const inputs = component.find('input')

      expect(inputs.at(0).props().defaultValue).toBe(props.section.get('url'))
      expect(inputs.at(1).props().defaultValue).toBe(props.section.get('height'))
      expect(inputs.at(2).props().defaultValue).toBe(props.section.get('mobile_height'))
    })

    it('Can change URL', () => {
      const component = mount(
        <EmbedControls {...props} />
      )
      const input = component.find('input').at(0)
      const e = {target: {value: 'new value'}}
      input.simulate('change', e)

      expect(props.section.get('url')).toBe(e.target.value)
    })

    it('Can change height', () => {
      const component = mount(
        <EmbedControls {...props} />
      )
      const input = component.find('input').at(1)
      const e = {target: {value: '500'}}
      input.simulate('change', e)

      expect(props.section.get('height')).toBe(e.target.value)
    })

    it('Can change mobile height', () => {
      const component = mount(
        <EmbedControls {...props} />
      )
      const input = component.find('input').at(2)
      const e = {target: {value: '200'}}
      input.simulate('change', e)

      expect(props.section.get('mobile_height')).toBe(e.target.value)
    })
  })
})
