import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { CharacterLimit } from '../../../../../components/character_limit'
import { DisplaySocial } from '../components/social'
import ImageUpload from 'client/apps/edit2/components/admin/components/image_upload.coffee'

xdescribe('DisplaySocial', () => {
  let props
  let social_description
  let social_image
  let social_title

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      onChange: jest.fn()
    }
    social_description = 'To create a total experience that will create a feeling that is qualitatively new'
    social_image = 'https://artsy-media-uploads.s3.amazonaws.com/-El3gm6oiFkOUKhUv79lGQ%2Fd7hftxdivxxvm.cloudfront-6.jpg'
    social_title = 'Virtual Reality Is the Most Powerful Artistic Medium of Our Time'

    props.article.set({
      social_description,
      social_image,
      social_title
    })
  })

  it('Renders all form fields', () => {
    const component = mount(
      <DisplaySocial {...props} />
    )
    expect(component.find(CharacterLimit).length).toBe(2)
    expect(component.find(ImageUpload).length).toBe(1)
  })

  it('Can display saved data', () => {
    const component = mount(
      <DisplaySocial {...props} />
    )
    expect(component.html()).toMatch(props.article.get('social_title'))
    expect(component.html()).toMatch(props.article.get('social_description'))
    expect(component.html()).toMatch('El3gm6oiFkOUKhUv79lGQ%252Fd7hftxdivxxvm.cloudfront-6.jpg')
  })

  it('Can change the thumbnail image', () => {
    const component = mount(
      <DisplaySocial {...props} />
    )
    const input = component.find(ImageUpload).at(0).getElement()
    input.props.onChange(input.props.name, 'http://new-image.jpg')

    expect(props.onChange.mock.calls[0][0]).toBe('social_image')
    expect(props.onChange.mock.calls[0][1]).toBe('http://new-image.jpg')
  })

  it('Can change the thumbnail title', () => {
    const component = mount(
      <DisplaySocial {...props} />
    )
    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('New title')

    expect(props.onChange.mock.calls[0][0]).toBe('social_title')
    expect(props.onChange.mock.calls[0][1]).toBe('New title')
  })

  it('Can change the description', () => {
    const component = mount(
      <DisplaySocial {...props} />
    )
    const input = component.find(CharacterLimit).at(1).getElement()
    input.props.onChange('New description')

    expect(props.onChange.mock.calls[0][0]).toBe('social_description')
    expect(props.onChange.mock.calls[0][1]).toBe('New description')
  })
})
