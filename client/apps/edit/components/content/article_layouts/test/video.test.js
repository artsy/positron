import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../../models/article.coffee'
import { VideoAbout } from '@artsy/reaction-force/dist/Components/Publishing/Video/VideoAbout'
import { VideoCover } from '@artsy/reaction-force/dist/Components/Publishing/Video/VideoCover'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { EditVideo, EditVideoPublished } from '../video'
require('typeahead.js')

describe('EditVideo', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.VideoArticle),
      onChange: jest.fn()
    }
  })

  it('Renders VideoCover with text fields', () => {
    const component = mount(
      <EditVideo {...props} />
    )
    expect(component.find(VideoCover).length).toBe(1)
    expect(component.find(PlainText).length).toBe(2)
  })

  it('Renders VideoAbout with paragraph fields', () => {
    const component = mount(
      <EditVideo {...props} />
    )
    expect(component.find(VideoAbout).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(2)
  })

  it('Renders a file input for video and cover', () => {
    const component = mount(
      <EditVideo {...props} />
    )
    expect(component.find(FileInput).length).toBe(2)
    expect(component.text()).toMatch('+ Change Video')
    expect(component.text()).toMatch('+ Change Cover Image')
  })

  it('#onMediaChange updates the media blob', () => {
    const component = mount(
      <EditVideo {...props} />
    )
    component.instance().onMediaChange('description', '')
    expect(props.onChange.mock.calls[0][1].description).toBe('')
    component.instance().onMediaChange('description', 'Sample Description')
    expect(props.onChange.mock.calls[0][1].description).toBe('Sample Description')
    component.instance().onMediaChange('duration', 100)
    expect(props.onChange.mock.calls[0][1].duration).toBe(100)
    component.instance().onMediaChange('published', false)
    expect(props.onChange.mock.calls[0][1].published).toBe(false)
  })

  it('toggles published state on media', () => {
    const component = mount(
      <EditVideo {...props} />
    )
    component.find(EditVideoPublished).simulate('click')
    expect(props.onChange.mock.calls[0][1].published).toBe(true)
  })

  it('sets release_date on media', () => {
    const component = mount(
      <EditVideo {...props} />
    )
    const input = component.find('input[type="date"]')
    input.simulate('change', { target: { value: '2017-02-07' } })
    expect(props.onChange.mock.calls[0][1].release_date).toMatch('2017-02-07')
  })
})
