import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { CharacterLimit } from '../../../../../components/character_limit'
import { DisplayPartner } from '../components/partner'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

xdescribe('DisplayPartner', () => {
  let props
  let thumbnail_image

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      onChange: jest.fn()
    }
    thumbnail_image = 'https://artsy-media-uploads.s3.amazonaws.com/-El3gm6oiFkOUKhUv79lGQ%2Fd7hftxdivxxvm.cloudfront-6.jpg'
    props.article.set({ thumbnail_image })
  })

  it('Renders all form fields', () => {
    const component = mount(
      <DisplayPartner {...props} />
    )
    expect(component.find(CharacterLimit).length).toBe(1)
    expect(component.find(ImageUpload).length).toBe(1)
  })

  it('Can display saved data', () => {
    const component = mount(
      <DisplayPartner {...props} />
    )
    expect(component.html()).toMatch(props.article.get('thumbnail_title'))
    expect(component.html()).toMatch('El3gm6oiFkOUKhUv79lGQ%252Fd7hftxdivxxvm.cloudfront-6.jpg')
  })

  it('Can change the thumbnail image', () => {
    const component = mount(
      <DisplayPartner {...props} />
    )
    const input = component.find(ImageUpload).at(0).getElement()
    input.props.onChange(input.props.name, 'http://new-image.jpg')

    expect(props.onChange.mock.calls[0][0]).toBe('thumbnail_image')
    expect(props.onChange.mock.calls[0][1]).toBe('http://new-image.jpg')
  })

  it('Can change the thumbnail title', () => {
    const component = mount(
      <DisplayPartner {...props} />
    )
    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('New title')

    expect(props.onChange.mock.calls[0][0]).toBe('thumbnail_title')
    expect(props.onChange.mock.calls[0][1]).toBe('New title')
  })
})
