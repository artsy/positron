import { mount } from 'enzyme'
import React from 'react'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../models/article'
import { CharacterLimit } from '../../../../../components/character_limit'
import { DisplayEmail } from '../components/email'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

xdescribe('DisplayEmail', () => {
  let props
  let email_metadata = {
    author: 'Molly Gottschalk',
    custom_text: 'To create a total experience that will create a feeling that is qualitatively new: That is ultimately the most radical thing.',
    headline: 'Virtual Reality Is the Most Powerful Artistic Medium of Our Time',
    image_url: 'https://artsy-media-uploads.s3.amazonaws.com/-El3gm6oiFkOUKhUv79lGQ%2Fd7hftxdivxxvm.cloudfront-6.jpg'
  }

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.StandardArticle),
      onChange: jest.fn()
    }
    props.article.set({ email_metadata })
  })

  xit('Renders all form fields', () => {
    props.article.unset('email_metadata')
    const component = mount(
      <DisplayEmail {...props} />
    )
    expect(component.find(CharacterLimit).length).toBe(2)
    expect(component.find('input').length).toBe(3)
    expect(component.find(ImageUpload).length).toBe(1)
    expect(component.find('input[type="checkbox"]').length).toBe(1)
  })

  it('Can display saved data', () => {
    const component = mount(
      <DisplayEmail {...props} />
    )
    expect(component.html()).toMatch(props.article.get('email_metadata').author)
    expect(component.html()).toMatch(props.article.get('email_metadata').custom_text)
    expect(component.html()).toMatch(props.article.get('email_metadata').headline)
    expect(component.html()).toMatch('El3gm6oiFkOUKhUv79lGQ%252Fd7hftxdivxxvm.cloudfront-6.jpg')
  })

  it('Can save with empty email_metadata', () => {
    props.article.unset('email_metadata')
    const component = mount(
      <DisplayEmail {...props} />
    )
    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('data')
    expect(props.onChange.mock.calls[0][0]).toBe('email_metadata')
  })

  xit('Can change the email image', () => {
    const component = mount(
      <DisplayEmail {...props} />
    )
    const input = component.find(ImageUpload).at(0).getElement()
    input.props.onChange(input.props.name, 'http://new-image.jpg')

    expect(props.onChange.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChange.mock.calls[0][1].image_url).toBe('http://new-image.jpg')
  })

  it('Can change the email headline', () => {
    const component = mount(
      <DisplayEmail {...props} />
    )
    const input = component.find(CharacterLimit).at(0).getElement()
    input.props.onChange('New Headline')

    expect(props.onChange.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChange.mock.calls[0][1].headline).toBe('New Headline')
  })

  it('Can change the custom text', () => {
    const component = mount(
      <DisplayEmail {...props} />
    )
    const input = component.find(CharacterLimit).at(1).getElement()
    input.props.onChange('New Custom Text')

    expect(props.onChange.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChange.mock.calls[0][1].custom_text).toBe('New Custom Text')
  })

  it('Can change the author', () => {
    const component = mount(
      <DisplayEmail {...props} />
    )
    const input = component.find('input[name="author"]').at(0)
    input.simulate('change', { target: { name: 'author', value: 'New Author' } })

    expect(props.onChange.mock.calls[0][0]).toBe('email_metadata')
    expect(props.onChange.mock.calls[0][1].author).toBe('New Author')
  })

  it('Can change the send to sailthru checkbox', () => {
    const component = mount(
      <DisplayEmail {...props} />
    )
    const input = component.find('.flat-checkbox').at(0)
    input.simulate('click')

    expect(props.onChange.mock.calls[0][0]).toBe('send_body')
    expect(props.onChange.mock.calls[0][1]).toBe(!props.article.get('send_body'))
  })
})
