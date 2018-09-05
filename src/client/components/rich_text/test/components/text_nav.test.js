import React from 'react'
import { mount } from 'enzyme'
import { extend } from 'lodash'
import { TextNav } from '../../components/text_nav.jsx'
import { blockTypes, inlineStyles } from 'client/apps/edit/components/content/sections/text/draft_config.js'
import { IconArtist } from '@artsy/reaction/dist/Components/Publishing/Icon/IconArtist'
import { IconBlockquote } from '@artsy/reaction/dist/Components/Publishing/Icon/IconBlockquote'
import { IconClearFormatting } from '@artsy/reaction/dist/Components/Publishing/Icon/IconClearFormatting'
import { IconLink } from '@artsy/reaction/dist/Components/Publishing/Icon/IconLink'
import { IconOrderedList } from '@artsy/reaction/dist/Components/Publishing/Icon/IconOrderedList'
import { IconUnorderedList } from '@artsy/reaction/dist/Components/Publishing/Icon/IconUnorderedList'

describe('TextNav', () => {
  let props

  describe('Rendering', () => {
    beforeEach(() => {
      props = {
        blocks: [],
        position: {},
        styles: [],
        toggleBlock: jest.fn(),
        toggleStyle: jest.fn()
      }
    })

    it('renders no buttons by default', () => {
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.find('button').length).toBe(0)
    })

    it('renders link button if props.promptForLink', () => {
      props.promptForLink = jest.fn()
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.find('button').length).toBe(1)
      expect(component.find(IconLink).length).toBe(1)
    })

    it('renders plain-text button if props.makePlainText', () => {
      props.makePlainText = jest.fn()
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.find('button').length).toBe(1)
      expect(component.find(IconClearFormatting).length).toBe(1)
    })

    it('renders artist button if props.hasFeatures and props.promptForLink', () => {
      props.hasFeatures = true
      props.promptForLink = jest.fn()
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.find('button').length).toBe(2)
      expect(component.find(IconArtist).length).toBe(1)
    })

    it('renders italic button if props.styles includes it', () => {
      props.styles = [{ name: 'italic', label: 'I' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.html()).toMatch('class="italic"')
      expect(component.find('button').text()).toBe('I')
      expect(component.find('button').length).toBe(1)
    })

    it('renders bold button if props.styles includes it', () => {
      props.styles = [{ name: 'bold', label: 'B' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.html()).toMatch('class="bold"')
      expect(component.find('button').text()).toBe('B')
      expect(component.find('button').length).toBe(1)
    })

    it('renders h1 button if props.blocks includes it', () => {
      props.blocks = [{ name: 'header-one', label: 'H1' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.html()).toMatch('class="header-one"')
      expect(component.find('button').text()).toBe('H1')
      expect(component.find('button').length).toBe(1)
    })

    it('renders h2 button if props.blocks includes it', () => {
      props.blocks = [{ name: 'header-two', label: 'H2' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.html()).toMatch('class="header-two"')
      expect(component.find('button').text()).toBe('H2')
      expect(component.find('button').length).toBe(1)
    })

    it('renders h3 button if props.blocks includes it', () => {
      props.blocks = [{ name: 'header-three', label: 'H3' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.html()).toMatch('class="header-three"')
      expect(component.find('button').text()).toBe('H3')
      expect(component.find('button').length).toBe(1)
    })

    it('renders blockquote button if props.blocks includes it', () => {
      props.blocks = [{ name: 'blockquote' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.find(IconBlockquote).length).toBe(1)
      expect(component.find('button').length).toBe(1)
    })

    it('renders OL button if props.blocks includes it', () => {
      props.blocks = [{ name: 'ordered-list-item' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.find(IconOrderedList).length).toBe(1)
      expect(component.find('button').length).toBe(1)
    })

    it('renders UL button if props.blocks includes it', () => {
      props.blocks = [{ name: 'unordered-list-item' }]
      const component = mount(
        <TextNav {...props} />
      )
      expect(component.find(IconUnorderedList).length).toBe(1)
      expect(component.find('button').length).toBe(1)
    })

    describe('Positon/Width', () => {
      it('Sets the width to 250px if > 8 buttons (editorial)', () => {
        props = extend(props, {
          blocks: blockTypes('feature', true),
          hasFeatures: true,
          styles: inlineStyles(),
          makePlainText: jest.fn(),
          promptForLink: jest.fn()
        })

        const component = mount(
          <TextNav {...props} />
        )
        const nav = component.find('.TextNav').first().getElement()
        expect(nav.props.style.width).toBe('250px')
      })

      it('Sets the width to 200px if 8 buttons (partner)', () => {
        props = extend(props, {
          blocks: blockTypes('classic', false),
          hasFeatures: false,
          styles: inlineStyles('classic'),
          makePlainText: jest.fn(),
          promptForLink: jest.fn()
        })
        const component = mount(
          <TextNav {...props} />
        )
        const nav = component.find('.TextNav').first().getElement()
        expect(nav.props.style.width).toBe('200px')
      })

      it('Sets the width to 50px per button if less than 8 (captions)', () => {
        props = extend(props, {
          blocks: inlineStyles('classic'),
          promptForLink: jest.fn()
        })
        const component = mount(
          <TextNav {...props} />
        )
        const nav = component.find('.TextNav').first().getElement()
        expect(nav.props.style.width).toBe('150px')
      })

      it('Sets the nav position based on props', () => {
        props = extend(props, {
          blocks: inlineStyles('classic'),
          position: {
            top: 120,
            left: 200
          }
        })
        const component = mount(
          <TextNav {...props} />
        )
        const nav = component.find('.TextNav').first().getElement()
        expect(nav.props.style.top).toBe(120)
        expect(nav.props.style.marginLeft).toBe(200)
      })
    })
  })

  describe('Actions', () => {
    beforeEach(() => {
      props = {
        blocks: [{ name: 'blockquote' }],
        hasFeatures: true,
        makePlainText: jest.fn(),
        position: {},
        promptForLink: jest.fn(),
        styles: [{ name: 'italic' }],
        toggleBlock: jest.fn(),
        toggleStyle: jest.fn()
      }
    })

    it('Can toggle styles on click', () => {
      const component = mount(
        <TextNav {...props} />
      )
      component.find('button.italic').at(0).simulate('mouseDown')
      expect(props.toggleStyle.mock.calls[0][0]).toBe('italic')
    })

    it('Can toggle blocks on click', () => {
      const component = mount(
        <TextNav {...props} />
      )
      component.find('button.blockquote').at(0).simulate('mouseDown')
      expect(props.toggleBlock.mock.calls[0][0]).toBe('blockquote')
    })

    it('Can toggle a link prompt on link click', () => {
      const component = mount(
        <TextNav {...props} />
      )
      component.find('button.link').at(0).simulate('mouseDown')
      expect(props.promptForLink).toHaveBeenCalled()
    })

    it('Can toggle a link prompt with plugin args on artist click', () => {
      const component = mount(
        <TextNav {...props} />
      )
      component.find('button.artist').at(0).simulate('mouseDown')
      expect(props.promptForLink.mock.calls[0][0]).toBe('artist')
    })

    it('Can toggle makePlainText', () => {
      const component = mount(
        <TextNav {...props} />
      )
      component.find('button.clear-formatting').at(0).simulate('mouseDown')
      expect(props.makePlainText).toHaveBeenCalled()
    })
  })
})
