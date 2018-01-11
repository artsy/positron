import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../../models/article'
import ImageUpload from '../../components/image_upload.coffee'
import { AdminSponsor } from '../../components/sponsor.jsx'

describe('EditAdmin', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      onChange: jest.fn()
    }
  })

  describe('Sponsor Logos', () => {
    it('Renders file inputs', () => {
      const component = mount(
        <AdminSponsor {...props} />
      )
      expect(component.find(ImageUpload).length).toBe(3)
      expect(component.text()).toMatch('Logo Light')
      expect(component.text()).toMatch('Logo Dark')
      expect(component.text()).toMatch('Logo Condensed')
    })

    it('Can render saved data', () => {
      props.article.set({
        sponsor: {
          partner_light_logo: 'http://partner_light_logo.jpg',
          partner_dark_logo: 'http://partner_dark_logo.jpg',
          partner_condensed_logo: 'http://partner_condensed_logo.jpg'
        }
      })
      const component = mount(
        <AdminSponsor {...props} />
      )
      expect(component.html()).toMatch('partner_light_logo.jpg')
      expect(component.html()).toMatch('partner_dark_logo.jpg')
      expect(component.html()).toMatch('partner_condensed_logo.jpg')
    })

    it('Can add a light logo', () => {
      const component = mount(
        <AdminSponsor {...props} />
      )
      const input = component.find(ImageUpload).first().getElement()
      input.props.onChange(input.props.name, 'http://new-image.jpg')

      expect(props.onChange.mock.calls[0][0]).toBe('sponsor')
      expect(props.onChange.mock.calls[0][1].partner_light_logo).toBe('http://new-image.jpg')
    })

    it('Can add a dark logo', () => {
      const component = mount(
        <AdminSponsor {...props} />
      )
      const input = component.find(ImageUpload).at(1).getElement()
      input.props.onChange(input.props.name, 'http://new-image.jpg')

      expect(props.onChange.mock.calls[0][0]).toBe('sponsor')
      expect(props.onChange.mock.calls[0][1].partner_dark_logo).toBe('http://new-image.jpg')
    })

    it('Can add a condensed logo', () => {
      const component = mount(
        <AdminSponsor {...props} />
      )
      const input = component.find(ImageUpload).last().getElement()
      input.props.onChange(input.props.name, 'http://new-image.jpg')

      expect(props.onChange.mock.calls[0][0]).toBe('sponsor')
      expect(props.onChange.mock.calls[0][1].partner_condensed_logo).toBe('http://new-image.jpg')
    })
  })

  describe('Sponsor Url', () => {
    it('Renders input', () => {
      const component = mount(
        <AdminSponsor {...props} />
      )
      expect(component.find('input').last().instance().placeholder).toMatch('http://example.com')
    })

    it('Can render saved data', () => {
      props.article.set({
        sponsor: { partner_logo_link: 'http://partner.com' }
      })
      const component = mount(
        <AdminSponsor {...props} />
      )
      expect(component.find('input').last().instance().value).toMatch('http://partner.com')
    })

    it('Calls props.onChange when input changes', () => {
      const component = mount(
        <AdminSponsor {...props} />
      )
      const input = component.find('input').last()
      input.simulate('change', { target: { value: 'New URL' } })
      expect(props.onChange.mock.calls[0][0]).toBe('sponsor')
      expect(props.onChange.mock.calls[0][1].partner_logo_link).toBe('New URL')
    })
  })
})
