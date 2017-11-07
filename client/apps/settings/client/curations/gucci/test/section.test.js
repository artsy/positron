import React from 'react'
import { SectionAdmin } from '../components/section.jsx'
import { mount } from 'enzyme'

import ImageUpload from 'client/apps/edit/components/admin/components/image_upload.coffee'
import Paragraph from 'client/components/rich_text2/components/paragraph.coffee'

describe('Section Admin', () => {
  const section = {
    title: 'I. Past',
    featuring: 'Rachel Uffner, Petra Collins, Narcissiter, Genevieve Gaignard',
    release_date: '2017-11-11T05:00:00.000Z',
    about: '<p>About this film...</p>',
    video_url: 'http://youtube.com/movie',
    cover_image_url: 'http://cover-image.jpg',
    published: true
  }
  const props = {
    section,
    onChange: jest.fn()
  }

  it('renders all fields', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    expect(component.find(ImageUpload).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(1)
    expect(component.find('input').length).toBe(5)
    expect(component.find('input[type="date"]').length).toBe(1)
  })

  it('renders saved data', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    expect(component.find('input').first().props().defaultValue).toMatch('Rachel Uffner, Petra Collins, Narcissiter, Genevieve Gaignard')
    expect(component.text()).toMatch('About this film')
    expect(component.html()).toMatch('cover-image.jpg')
    expect(component.find('input').at(2).props().checked).toBe(true)
    expect(component.find('input').at(3).props().defaultValue).toMatch('http://youtube.com/movie')
    expect(component.find('input[type="date"]').first().props().defaultValue).toMatch('2017-11-11')
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

    expect(props.onChange.mock.calls[1][0]).toMatch('about')
    expect(props.onChange.mock.calls[1][1]).toMatch('About this video')
  })

  it('Updates release date and saves as iso', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const input = component.find('input').at(1)
    input.simulate('change', { target: { value: '2017-11-15' } })

    expect(props.onChange.mock.calls[2][0]).toMatch('release_date')
    expect(props.onChange.mock.calls[2][1]).toMatch('2017-11-15T')
  })

  it('Updates video url on input', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const input = component.find('input').at(3)
    input.simulate('change', { target: { value: 'http://vimeo.com/video' } })

    expect(props.onChange.mock.calls[3][0]).toMatch('video_url')
    expect(props.onChange.mock.calls[3][1]).toMatch('http://vimeo.com/video')
  })

  it('Updates cover image on upload', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    const input = component.find(ImageUpload).at(0).node
    input.props.onChange(input.props.name, 'http://cover-image.jpg')

    expect(props.onChange.mock.calls[4][0]).toMatch('cover_image_url')
    expect(props.onChange.mock.calls[4][1]).toMatch('http://cover-image.jpg')
  })

  it('Updates published on checkbox click', () => {
    const component = mount(
      <SectionAdmin {...props} />
    )
    component.find('.flat-checkbox').first().simulate('click')
    expect(props.onChange.mock.calls[5][0]).toMatch('published')
    expect(props.onChange.mock.calls[5][1]).toBe(false)
  })
})
