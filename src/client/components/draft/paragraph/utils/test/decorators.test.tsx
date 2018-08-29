import { convertFromHTML } from 'draft-convert'
import { EditorState } from 'draft-js'
import { mount } from 'enzyme'
import React from 'react'
import { htmlToEntity } from '../convert'
import {
  decorators,
  findLinkEntities,
  getDecorators,
  Link,
  LinkProps,
} from '../decorators'

describe('Decorators', () => {
  const htmlWithLink = '<p><a href="https://artsy.net">a link</a></p>'

  const getEditorState = html => {
    const currentContent = convertFromHTML({ htmlToEntity })(html)

    return EditorState.createWithContent(currentContent, decorators(true))
  }

  describe('#getDecorators', () => {
    it('If hasLinks, returns link strategy/component', () => {
      const decorator = getDecorators(true)[0]

      expect(decorator.strategy).toBe(findLinkEntities)
      expect(decorator.component).toBe(Link)
    })

    it('If not hasLinks, returns empty array', () => {
      const decorator = getDecorators(false)
      expect(decorator).toHaveLength(0)
    })
  })

  describe('#findLinkEntities', () => {
    it('Returns callback if link is present', () => {
      const contentState = getEditorState(htmlWithLink).getCurrentContent()
      const block = contentState.getFirstBlock()
      const hasLinks = jest.fn()
      findLinkEntities(block, hasLinks, contentState)

      expect(hasLinks).toBeCalled()
    })

    it('Returns nothing if no links', () => {
      const contentState = getEditorState(
        '<p>a paragraph</p>'
      ).getCurrentContent()
      const block = contentState.getFirstBlock()
      const hasLinks = jest.fn()
      findLinkEntities(block, hasLinks, contentState)

      expect(hasLinks).not.toBeCalled()
    })
  })

  describe('Link', () => {
    const getWrapper = (linkProps: LinkProps) => {
      return mount(<Link {...linkProps} />)
    }
    const contentState = getEditorState(htmlWithLink).getCurrentContent()
    const entityKey = contentState.getLastCreatedEntityKey()
    const props = {
      children: 'a link',
      contentState,
      entityKey,
    }

    it('Creates a link with correct entity data', () => {
      const component = getWrapper(props)
      expect(component.html()).toBe('<a href="https://artsy.net/">a link</a>')
    })

    it('Prevents default on link clicks', () => {
      const component = getWrapper(props)
      const preventDefault = jest.fn()
      component.simulate('click', { preventDefault })

      expect(preventDefault).toBeCalled()
    })
  })
})
