import React from 'react'
import { mount } from 'enzyme'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from '../../../../../../models/article'
import { FixedBackground } from '@artsy/reaction-force/dist/Components/Publishing/Series/FixedBackground'
import { SeriesAbout } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesAbout'
import { SeriesTitle } from '@artsy/reaction-force/dist/Components/Publishing/Series/SeriesTitle'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { RelatedArticles } from '/client/apps/edit/components/content/sections/related_articles'
import { EditSeries } from '../series'
require('typeahead.js')

describe('EditSeries', () => {
  let props

  beforeEach(() => {
    props = {
      article: new Article(Fixtures.SeriesArticle),
      onChange: jest.fn()
    }
  })

  it('Renders SeriesTitle', () => {
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(SeriesTitle).length).toBe(1)
    expect(component.find(PlainText).length).toBe(1)
  })

  it('Renders RelatedArticles list', () => {
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(RelatedArticles).length).toBe(1)
  })

  it('Renders SeriesAbout', () => {
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(SeriesAbout).length).toBe(1)
    expect(component.find(Paragraph).length).toBe(1)
  })

  it('Renders a file input for background image ', () => {
    props.article.set('hero_section', { url: null })
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(FileInput).length).toBe(1)
    expect(component.text()).toMatch('+ Add Background')
  })

  it('Can save a hero_section with type', () => {
    props.article.unset('hero_section')
    const component = mount(
      <EditSeries {...props} />
    )
    const input = component.find(FileInput).first().getElement()
    input.props.onUpload('http://new-image.jpg')
    expect(props.onChange.mock.calls[0][0]).toBe('hero_section')
    expect(props.onChange.mock.calls[0][1].url).toBe('http://new-image.jpg')
    expect(props.onChange.mock.calls[0][1].type).toBe('series')
  })

  it('Renders a background image if url', () => {
    props.article.set('hero_section', {url: 'http://image.jpg'})
    const component = mount(
      <EditSeries {...props} />
    )
    expect(component.find(FixedBackground).length).toBe(1)
    expect(component.find(FixedBackground).props().backgroundUrl).toBe('http://image.jpg')
    expect(component.text()).toMatch('+ Change Background')
  })
})
