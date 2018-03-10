import request from 'superagent'
import { mount } from 'enzyme'
import React from 'react'
import { AutocompleteList } from 'client/components/autocomplete2/list'
import { AdminSuperArticle } from '../../components/super_article'
import ImageUpload from '../../components/image_upload.coffee'
require('typeahead.js')

jest.mock('superagent', () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.genMockFunction().mockReturnThis(),
    end: jest.fn()
  }
})

describe('AdminSuperArticle', () => {
  let props
  let super_article

  beforeEach(() => {
    request.end.mockImplementation((cb) => {
      cb(null, {
        body: {
          data: {
            articles: [ {id: 123, title: 'Related Article'} ]
          }
        }
      })
    })

    super_article = {
      footer_blurb: 'footer_blurb',
      footer_title: 'footer_title',
      partner_fullscreen_header_logo: 'partner_fullscreen_header_logo.jpg',
      partner_link: 'partner_link.com',
      partner_link_title: 'partner_link_title',
      partner_logo: 'partner_logo.jpg',
      partner_logo_link: 'partner_logo_link.com',
      related_articles: ['123'],
      secondary_logo_link: 'secondary_logo_link.com',
      secondary_logo_text: 'secondary_logo_text',
      secondary_partner_logo: 'secondary_partner_logo.jpg'
    }

    props = {
      article: {},
      user: {access_token: '123'},
      onChangeArticleAction: jest.fn()
    }
  })

  const getWrapper = (props) => {
    return mount(
      <AdminSuperArticle {...props} />
    )
  }

  it('Renders input fields', () => {
    const component = getWrapper(props)
    expect(component.find('input').length).toBe(11)
    expect(component.find(ImageUpload).length).toBe(3)
    expect(component.find('textarea').length).toBe(1)
  })

  it('Renders saved data', () => {
    props.article.super_article = super_article
    const component = getWrapper(props)
    expect(component.html()).toMatch(super_article.footer_blurb)
    expect(component.html()).toMatch(super_article.footer_title)
    expect(component.html()).toMatch(super_article.partner_fullscreen_header_logo)
    expect(component.html()).toMatch(super_article.partner_link)
    expect(component.html()).toMatch(super_article.partner_link_title)
    expect(component.html()).toMatch(super_article.partner_logo)
    expect(component.html()).toMatch(super_article.partner_logo_link)
    expect(component.html()).toMatch(super_article.secondary_logo_link)
    expect(component.html()).toMatch(super_article.secondary_logo_text)
    expect(component.html()).toMatch(super_article.secondary_partner_logo)
  })

  it('Disables inputs when is_super_article is false', () => {
    const component = getWrapper(props)

    expect(component.find('input[disabled=true]').length).toBe(10)
    expect(component.find('textarea[disabled]').length).toBe(1)
    expect(component.find(AutocompleteList).getElement().props.disabled).toBe(true)
  })

  it('Enables inputs when is_super_article is true', () => {
    props.article.is_super_article = true
    const component = getWrapper(props)

    expect(component.find('input[disabled=true]').length).toBe(0)
    expect(component.find('textarea[disabled=true]').length).toBe(0)
    expect(component.find(AutocompleteList).getElement().props.disabled).toBe(false)
  })

  it('Can change text inputs', () => {
    props.article.is_super_article = true
    const component = getWrapper(props)
    const input = component.find('input').at(1)
    const value = 'new text'
    input.simulate('change', {target: { value }})

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('super_article')
    expect(props.onChangeArticleAction.mock.calls[0][1].partner_link_title).toBe(value)
  })

  it('Can change file inputs', () => {
    props.article.is_super_article = true
    const component = getWrapper(props)
    const input = component.find(ImageUpload).first().getElement()
    const value = 'image.jpg'
    input.props.onChange('partner_logo', value)

    expect(props.onChangeArticleAction.mock.calls[0][0]).toBe('super_article')
    expect(props.onChangeArticleAction.mock.calls[0][1].partner_logo).toBe(value)
  })

  it('#fetchArticles calls callback with list of fetched articles', () => {
    props.article.super_article = {related_articles: ['123']}
    const component = getWrapper(props)
    const cb = jest.fn()
    component.instance().fetchArticles([], cb)

    expect(cb.mock.calls[0][0][0].title).toBe('Related Article')
  })
})
