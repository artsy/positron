import React from 'react'
import { mount } from 'enzyme'
import { Embed, Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '/client/models/article.coffee'
import Channel from '/client/models/channel.coffee'
import Section from '/client/models/section.coffee'
import { SectionEmbed } from '../index'
import { EmbedControls } from '../controls.jsx'

const { StandardArticle } = Fixtures

describe('Section Embed', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article({layout: 'standard'}),
      channel: new Channel(),
      section: new Section(StandardArticle.sections[10])
    }
  })

  describe('Section Embed', () => {
    it('Renders saved data', () => {
      const component = mount(
        <SectionEmbed {...props} />
      )
      expect(component.find(Embed).length).toBe(1)
    })

    it('Renders placeholder if empty', () => {
      props.section = new Section()
      const component = mount(
        <SectionEmbed {...props} />
      )
      expect(component.find(Embed).length).toBe(0)
      expect(component.text()).toBe('Add URL above')
    })

    it('Renders controls if editing', () => {
      props.editing = true
      const component = mount(
        <SectionEmbed {...props} />
      )
      expect(component.find(EmbedControls).length).toBe(1)
    })

    it('Destroys section on unmount if URL is empty', () => {
      props.section = new Section()
      const spy = jest.spyOn(props.section, 'destroy')
      const component = mount(
        <SectionEmbed {...props} />
      )
      component.instance().componentWillUnmount()
      expect(spy).toHaveBeenCalled()
    })
  })
})
