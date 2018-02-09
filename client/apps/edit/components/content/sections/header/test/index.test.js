import React from 'react'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { Fixtures, Header } from '@artsy/reaction-force/dist/Components/Publishing'
import FileInput from '/client/components/file_input/index.jsx'
import Paragraph from '/client/components/rich_text/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text/components/plain_text.jsx'
import { SectionHeader } from '../index.jsx'
import { HeaderControls } from 'client/apps/edit/components/content/sections/header/controls'
const {
  ClassicArticle,
  FeatureArticle,
  StandardArticle
} = Fixtures

jest.mock('react-sizeme', () => jest.fn(c => d => d))

describe('Header', () => {
  let props

  const getWrapper = (props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      app: {
        channel: {}
      },
      edit: {
        article: props.article
      }
    })

    return mount(
      <Provider store={store}>
        <SectionHeader {...props} />
      </Provider>
    )
  }

  describe('Classic', () => {
    beforeEach(() => {
      props = {
        article: clone(ClassicArticle),
        onChange: jest.fn()
      }
    })

    it('renders the classic header', () => {
      const component = getWrapper(props)

      expect(component.find(Header).length).toBe(1)
      expect(component.html()).toMatch('ClassicHeader__ClassicHeaderContainer')
      expect(component.html()).toMatch('ClassicHeader__Title')
      expect(component.html()).toMatch('AuthorDateClassic')
      expect(component.html()).toMatch('Joanne Artman Gallery')
    })

    it('renders a saved title', () => {
      const component = getWrapper(props)

      expect(component.find(PlainText).text()).toMatch(ClassicArticle.title)
    })

    it('renders a title input', () => {
      props.article.title = ''
      const component = getWrapper(props)

      expect(component.find(PlainText).props().placeholder).toMatch('Title')
    })

    it('renders a leadParagraph input', () => {
      const component = getWrapper(props)

      expect(component.find(Paragraph).exists()).toBe(true)
      expect(component.find(Paragraph).text()).toMatch(
        'Critics were skeptical of Bambi when it was first released in 1942'
      )
    })
  })

  describe('Feature', () => {
    let hero_section

    beforeEach(() => {
      props = {
        article: clone(FeatureArticle),
        onChange: jest.fn(),
        onChangeHeroAction: jest.fn()
      }
      hero_section = clone(FeatureArticle.hero_section)
    })

    it('renders the feature header', () => {
      hero_section.type = 'split'
      props.article.hero_section = hero_section
      const component = getWrapper(props)

      expect(component.find(Header).exists()).toBe(true)
      expect(component.html()).toMatch('FeatureHeader__Div')
      expect(component.html()).toMatch('FeatureHeader__Vertical')
      expect(component.html()).toMatch('FeatureHeader__Title')
      expect(component.html()).toMatch('FeatureHeader__Deck')
      expect(component.html()).toMatch('Casey Lesser')
    })

    it('renders feature layout controls', () => {
      const component = getWrapper(props)
      expect(component.find(HeaderControls).exists()).toBe(true)
      expect(component.find(HeaderControls).text()).toMatch('Change Header')
    })

    it('renders a saved title', () => {
      const component = getWrapper(props)

      expect(component.find(PlainText).at(0).text()).toMatch(FeatureArticle.title)
    })

    it('renders a title input', () => {
      props.article.title = ''
      const component = getWrapper(props)

      expect(component.find(PlainText).at(0).props().placeholder).toMatch('Title')
    })

    it('renders a saved file', () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch('<video class="FeatureHeader__FeatureVideo')
      expect(component.find('video').getElement().props.src).toBe(props.article.hero_section.url)
    })

    it('renders a file input if no file', () => {
      hero_section.type = 'split'
      delete hero_section.url
      props.article.hero_section = hero_section
      const component = getWrapper(props)

      expect(component.text()).toMatch('Add Image or Video')
      expect(component.find(FileInput).exists()).toBe(true)
      expect(component.find(FileInput).getElement().props.video).toBe(true)
    })

    describe('Layout: Fullscreen', () => {
      it('renders a file input when has file', () => {
        hero_section.type = 'fullscreen'
        hero_section.url = 'https://artsy-media-uploads.s3.amazonaws.com/z9w_n6UxxoZ_u1lzt4vwrw%2FHero+Loop+02.mp4'
        props.article.hero_section = hero_section

        const component = getWrapper(props)

        expect(component.find(FileInput).exists()).toBe(true)
        expect(component.find(FileInput).getElement().props.prompt).toBe('Change Background')
      })

      it('renders add background prompt if no file', () => {
        delete hero_section.url
        hero_section.type = 'fullscreen'
        props.article.hero_section = hero_section
        const component = getWrapper(props)

        expect(component.find(FileInput).getElement().props.prompt).toBe('Add Background')
      })
    })
  })

  describe('Standard', () => {
    beforeEach(() => {
      props = {
        article: clone(StandardArticle),
        onChange: jest.fn()
      }
    })

    it('renders the standard header', () => {
      const component = getWrapper(props)

      expect(component.find(Header).length).toBe(1)
      expect(component.html()).toMatch('StandardHeader__StandardHeaderContainer')
      expect(component.html()).toMatch('StandardHeader__Vertical')
      expect(component.html()).toMatch('Art Market')
      expect(component.html()).toMatch('StandardHeader__Title')
      expect(component.html()).toMatch('Casey Lesser')
    })

    it('renders a saved title', () => {
      const component = getWrapper(props)

      expect(component.find(PlainText).at(0).text()).toMatch(StandardArticle.title)
    })

    it('renders a title input', () => {
      props.article.title = ''
      const component = getWrapper(props)

      expect(component.find(PlainText).at(0).props().placeholder).toMatch('Title')
    })
  })

  describe('Editing', () => {
    beforeEach(() => {
      props = {
        article: clone(FeatureArticle),
        onChange: jest.fn(),
        onChangeHeroAction: jest.fn()
      }
    })

    it('Can change a title', () => {
      const component = getWrapper(props)
      const title = 'New Title'
      component.find(PlainText).at(0).getElement().props.onChange(title)

      expect(props.onChange.mock.calls[0][0]).toBe('title')
      expect(props.onChange.mock.calls[0][1]).toBe(title)
    })

    it('Can change a deck', () => {
      const component = getWrapper(props)
      const deck = 'New deck'
      component.find(PlainText).at(1).getElement().props.onChange(deck)

      expect(props.onChangeHeroAction.mock.calls[0][0]).toBe('deck')
      expect(props.onChangeHeroAction.mock.calls[0][1]).toBe(deck)
    })

    it('Can change a leadParagraph', () => {
      props.article.layout = 'classic'
      const component = getWrapper(props)
      const lead_paragraph = 'New Lead Paragraph'
      component.find(Paragraph).getElement().props.onChange(lead_paragraph)

      expect(props.onChange.mock.calls[0][0]).toBe('lead_paragraph')
      expect(props.onChange.mock.calls[0][1]).toBe(lead_paragraph)
    })

    it('Can upload a header image', () => {
      const component = getWrapper(props)
      const src = 'http://image.jpg'
      component.find(FileInput).getElement().props.onUpload(
        src, 400, 300
      )

      expect(props.onChangeHeroAction.mock.calls[0][0]).toBe('url')
      expect(props.onChangeHeroAction.mock.calls[0][1]).toBe(src)
    })

    it('Can remove a header image', () => {
      props.article.hero_section.type = 'text'
      const component = getWrapper(props)
      component.find('.RemoveButton').simulate('click')

      expect(props.onChangeHeroAction.mock.calls[0][0]).toBe('url')
      expect(props.onChangeHeroAction.mock.calls[0][1]).toBe('')
    })
  })
})
