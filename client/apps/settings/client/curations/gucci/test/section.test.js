import React from 'react'
import { SectionAdmin } from '../components/section.jsx'
import { mount } from 'enzyme'

import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import Paragraph from 'client/components/rich_text2/components/paragraph.coffee'

describe('Section Admin', () => {
  let props
  const section = {
    title: 'I. Past',
    featuring: 'Rachel Uffner, Petra Collins, Narcissiter, Genevieve Gaignard',
    release_date: '2017-11-11T05:00:00.000Z',
    about: '<p>About this film...</p>',
    video_url: 'http://youtube.com/movie',
    cover_image_url: 'http://cover-image.jpg',
    published: true,
    social_title: 'What Happened in the Past?',
    social_description: 'A series of films optimized for social media',
    email_title: 'Good Morning, What Happened?',
    email_author: 'Artsy Editors',
    email_tags: 'magazine,article,gucci',
    keywords: 'women,gender,equality',
    thumbnail_image: 'http://thumbnail.jpg',
    email_image: 'http://emailimage.jpg',
    social_image: 'http://socialimage.jpg'
  }

  beforeEach(() => {
    props = {
      section,
      onChange: jest.fn()
    }
  })

  it('renders all fields', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    expect(component.find(ImageUpload).length).toBe(4)
    expect(component.find(Paragraph).length).toBe(1)
    expect(component.find('input').length).toBe(13)
    expect(component.find('textarea').length).toBe(1)
    expect(component.find('input[type="date"]').length).toBe(1)
  })

  it('renders saved data', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const html = component.html()
    expect(component.find('input').first().props().defaultValue).toMatch('Rachel Uffner, Petra Collins, Narcissiter, Genevieve Gaignard')
    expect(component.text()).toMatch('About this film')
    expect(html).toMatch('cover-image.jpg')
    expect(html).toMatch('thumbnail.jpg')
    expect(html).toMatch('emailimage.jpg')
    expect(html).toMatch('socialimage.jpg')
    expect(component.find('input').at(2).props().checked).toBe(true)
    expect(component.find('input').at(3).props().defaultValue).toMatch('http://youtube.com/movie')
    expect(component.find('input[type="date"]').first().props().defaultValue).toMatch('2017-11-11')
    expect(component.find('input').at(5).props().defaultValue).toBe('What Happened in the Past?')
    expect(component.find('textarea').at(0).props().defaultValue).toBe('A series of films optimized for social media')
    expect(component.find('input').at(6).props().defaultValue).toBe('Good Morning, What Happened?')
    expect(component.find('input').at(7).props().defaultValue).toBe('Artsy Editors')
    expect(component.find('input').at(8).props().defaultValue).toBe('magazine,article,gucci')
    expect(component.find('input').at(9).props().defaultValue).toBe('women,gender,equality')
  })

  it('Updates featuring section on input', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const input = component.find('input').first()
    input.simulate('change', { target: { value: 'Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum.' } })

    expect(props.onChange.mock.calls[0][0]).toMatch('featuring')
    expect(props.onChange.mock.calls[0][1]).toMatch('Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum.')
  })

  it('Updates about section on input', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    component.find(Paragraph).at(0).node.props.onChange('About this video')

    expect(props.onChange.mock.calls[0][0]).toMatch('about')
    expect(props.onChange.mock.calls[0][1]).toMatch('About this video')
  })

  it('Updates release date and saves as iso', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const input = component.find('input').at(1)
    input.simulate('change', { target: { value: '2017-11-15' } })

    expect(props.onChange.mock.calls[0][0]).toMatch('release_date')
    expect(props.onChange.mock.calls[0][1]).toMatch('2017-11-15T')
  })

  it('Updates video url on input', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const input = component.find('input').at(3)
    input.simulate('change', { target: { value: 'http://vimeo.com/video' } })

    expect(props.onChange.mock.calls[0][0]).toMatch('video_url')
    expect(props.onChange.mock.calls[0][1]).toMatch('http://vimeo.com/video')
  })

  it('Updates cover image on upload', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const input = component.find(ImageUpload).at(0).node
    input.props.onChange(input.props.name, 'http://cover-image.jpg')

    expect(props.onChange.mock.calls[0][0]).toMatch('cover_image_url')
    expect(props.onChange.mock.calls[0][1]).toMatch('http://cover-image.jpg')
  })

  it('Updates published on checkbox click', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    component.find('.flat-checkbox').first().simulate('click')
    expect(props.onChange.mock.calls[0][0]).toMatch('published')
    expect(props.onChange.mock.calls[0][1]).toBe(false)
  })

  it('Updates section metadata inputs', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const inputs = component.find('input')
    const textarea = component.find('textarea')
    inputs.at(5).simulate('change', { target: { value: 'Social Title' } })
    inputs.at(6).simulate('change', { target: { value: 'Email Title' } })
    inputs.at(7).simulate('change', { target: { value: 'Email Author' } })
    inputs.at(8).simulate('change', { target: { value: 'Email Tags' } })
    inputs.at(9).simulate('change', { target: { value: 'Keywords' } })
    textarea.at(0).simulate('change', { target: { value: 'Social Description' } })

    expect(props.onChange.mock.calls[0][0]).toMatch('social_title')
    expect(props.onChange.mock.calls[0][1]).toMatch('Social Title')
    expect(props.onChange.mock.calls[1][0]).toMatch('email_title')
    expect(props.onChange.mock.calls[1][1]).toMatch('Email Title')
    expect(props.onChange.mock.calls[2][0]).toMatch('email_author')
    expect(props.onChange.mock.calls[2][1]).toMatch('Email Author')
    expect(props.onChange.mock.calls[3][0]).toMatch('email_tags')
    expect(props.onChange.mock.calls[3][1]).toMatch('Email Tags')
    expect(props.onChange.mock.calls[4][0]).toMatch('keywords')
    expect(props.onChange.mock.calls[4][1]).toMatch('Keywords')
    expect(props.onChange.mock.calls[5][0]).toMatch('social_description')
    expect(props.onChange.mock.calls[5][1]).toMatch('Social Description')
  })

  it('Updates section metadata images', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const thumbnailInput = component.find(ImageUpload).at(1).node
    thumbnailInput.props.onChange(thumbnailInput.props.name, 'thumbnailImage.jpg')
    const socialInput = component.find(ImageUpload).at(2).node
    socialInput.props.onChange(socialInput.props.name, 'socialImage.jpg')
    const emailInput = component.find(ImageUpload).at(3).node
    emailInput.props.onChange(emailInput.props.name, 'emailImage.jpg')

    expect(props.onChange.mock.calls[0][0]).toMatch('thumbnail_image')
    expect(props.onChange.mock.calls[0][1]).toMatch('thumbnailImage.jpg')
    expect(props.onChange.mock.calls[1][0]).toMatch('social_image')
    expect(props.onChange.mock.calls[1][1]).toMatch('socialImage.jpg')
    expect(props.onChange.mock.calls[2][0]).toMatch('email_image')
    expect(props.onChange.mock.calls[2][1]).toMatch('emailImage.jpg')
  })
})
