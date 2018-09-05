import React from 'react'
import { mount } from 'enzyme'
import { SectionAdmin } from '../components/section'
import { Paragraph } from 'client/components/draft/paragraph/paragraph'
import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'

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
    expect(component.find('textarea').length).toBe(2)
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
    // FIXME TEST: Fragile date
    // expect(component.find('input[type="date"]').first().props().defaultValue).toMatch('2017-11-11')
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
    component.find(Paragraph).getElement().props.onChange('About this video')

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
    const input = component.find(ImageUpload).at(0).getElement()
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
})
