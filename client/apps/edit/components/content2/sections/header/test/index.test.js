import React from 'react'
import Article from '/client/models/article.coffee'
import Backbone from 'backbone'
import Paragraph from '/client/components/rich_text2/components/paragraph.coffee'
import SectionHeader from '../index.jsx'
import { mount } from 'enzyme'

import components from '@artsy/reaction-force/dist/components/publishing/index'
const Header = components.Header
const ClassicArticle = components.Fixtures.ClassicArticle
const FeatureArticle = components.Fixtures.FeatureArticle
const StandardArticle = components.Fixtures.StandardArticle

jest.mock("react-sizeme", () => jest.fn(c => d => d))

describe('Header', () => {

  beforeAll(() => {
    global.window.$ = jest.fn()
  })

  describe('Classic', () => {

    const props = {
      article: new Article(ClassicArticle)
    }

    it('renders the classic header', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.find(Header).length).toBe(1)
      expect(wrapper.html()).toMatch('classic_header__ClassicHeaderContainer')
      expect(wrapper.html()).toMatch('classic_header__Title')
      expect(wrapper.html()).toMatch('author_date_classic')
      expect(wrapper.html()).toMatch('Joanne Artman Gallery')
    })

    it('renders a saved title', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('New Study of Yale Grads Shows the Gender Pay Gap for Artists Is Not So Simple')
      expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
      expect(wrapper.find('.public-DraftEditorPlaceholder-inner').length).toBe(1)
    })

    it('renders a title input', () => {
      props.article.set('title', '')
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
      expect(wrapper.html()).toMatch('public-DraftEditorPlaceholder-inner')
    })

    it('renders a leadParagraph input', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.find(Paragraph).length).toBe(1)
      expect(wrapper.html()).toMatch('rich-text--paragraph')
      expect(wrapper.html()).toMatch('Lead Paragraph (optional)')
      expect(wrapper.find('.public-DraftEditorPlaceholder-inner').length).toBe(2)
      expect(wrapper.find(Paragraph).props().html).toMatch(
        '<p>Critics were skeptical of Bambi when it was first released in 1942'
        )
    })
  })

  describe('Feature', () => {

    const props = {
      article: new Article(FeatureArticle)
    }
    props.article.heroSection.set('type', 'split')

    it('renders the feature header', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.find(Header).length).toBe(1)
      expect(wrapper.html()).toMatch('feature_header__Div')
      expect(wrapper.html()).toMatch('feature_header__Vertical')
      expect(wrapper.html()).toMatch('feature_header__Title')
      expect(wrapper.html()).toMatch('feature_header__Deck')
      expect(wrapper.html()).toMatch('author_date__AuthorDateContainer')
      expect(wrapper.html()).toMatch('Casey Lesser')
    })

    it('renders feature layout controls', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('edit-header--controls')
      expect(wrapper.html()).toMatch('Change Header')
    })

    it('renders a saved title', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('What’s the Path to Winning an Art Prize?')
      expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
      expect(wrapper.find('.public-DraftEditorPlaceholder-inner').length).toBe(1)
    })

    it('renders a title input', () => {
      props.article.set('title', '')
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
      expect(wrapper.find('.public-DraftEditorPlaceholder-inner').length).toBe(2)
    })

    it('renders a saved file', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('<video class="feature_header__FeatureVideo')
      expect(wrapper.html()).toMatch(
        'src="https://artsy-media-uploads.s3.amazonaws.com/z9w_n6UxxoZ_u1lzt4vwrw%2FHero+Loop+02.mp4"'
      )
    })

    it('renders a file input if no file', () => {
      props.article.heroSection.set('url', '')
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('<h1>Add Image or Video</h1>')
      expect(wrapper.html()).toMatch('file-input__upload-container')
      expect(wrapper.html()).toMatch('<input type="file" accept=".jpg,.jpeg,.png,.gif,.mp4">')
    })

    describe('Layout: Fullscreen', () => {

      it('renders a file input when has file', () => {
        props.article.heroSection.set({
          type: 'fullscreen',
          url: 'https://artsy-media-uploads.s3.amazonaws.com/z9w_n6UxxoZ_u1lzt4vwrw%2FHero+Loop+02.mp4'
        })
        const wrapper = mount(
          <SectionHeader {...props} />
        )
        expect(wrapper.html()).toMatch('file-input__upload-container')
        expect(wrapper.html()).toMatch('<input type="file" accept=".jpg,.jpeg,.png,.gif,.mp4">')
      })

      it('renders change background prompt if has file', () => {
        const wrapper = mount(
          <SectionHeader {...props} />
        )
        expect(wrapper.html()).toMatch('<h1>Change Background</h1>')
      })

      it('renders add background prompt if no file', () => {
        props.article.heroSection.set({url: '', type: 'fullscreen'})
        const wrapper = mount(
          <SectionHeader {...props} />
        )
        expect(wrapper.html()).toMatch('<h1>Add Background</h1>')
      })
    })
  })

  describe('Standard', () => {

    const props = {
      article: new Article(StandardArticle)
    }

    it('renders the standard header', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.find(Header).length).toBe(1)
      expect(wrapper.html()).toMatch('standard_header__StandardHeaderContainer')
      expect(wrapper.html()).toMatch('standard_header__Vertical')
      expect(wrapper.html()).toMatch('Art Market')
      expect(wrapper.html()).toMatch('standard_header__Title')
      expect(wrapper.html()).toMatch('author_date__AuthorDateContainer')
      expect(wrapper.html()).toMatch('Artsy Editorial')
    })

    it('renders a saved title', () => {
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch("New York's Next Art District")
      expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
      expect(wrapper.find('.public-DraftEditorPlaceholder-inner').length).toBe(0)
    })

    it('renders a title input', () => {
      props.article.set('title', '')
      const wrapper = mount(
        <SectionHeader {...props} />
      )
      expect(wrapper.html()).toMatch('<div class="plain-text" name="title">')
      expect(wrapper.find('.public-DraftEditorPlaceholder-inner').length).toBe(1)
    })
  })
})