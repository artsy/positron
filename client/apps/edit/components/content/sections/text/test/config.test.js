import { pluck } from 'underscore'
import {
  ContentEnd,
  findContentEndEntities,
  findLinkEntities,
  Link
} from 'client/components/rich_text/utils/decorators'
import * as Config from '../draft_config'

describe('SectionText: Config', () => {
  describe('#blockRenderMapArray', () => {
    it('Returns the correct blocks for a feature article', () => {
      const blocks = Config.blockRenderMapArray('feature', true)

      expect(blocks).toEqual([
        'header-one',
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })

    it('Returns the correct blocks for a standard article', () => {
      const blocks = Config.blockRenderMapArray('standard', true)

      expect(blocks).toEqual([
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })

    it('Returns the correct blocks for a classic article with features', () => {
      const blocks = Config.blockRenderMapArray('classic', true)

      expect(blocks).toEqual([
        'header-two',
        'header-three',
        'blockquote',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })

    it('Returns the correct blocks for a classic article without features', () => {
      const blocks = Config.blockRenderMapArray('classic', false)

      expect(blocks).toEqual([
        'header-two',
        'header-three',
        'unordered-list-item',
        'ordered-list-item',
        'unstyled'
      ])
    })
  })

  describe('#inlineStyles', () => {
    it('Returns rich elements for a feature article', () => {
      const styles = pluck(Config.inlineStyles('feature'), 'name')

      expect(styles[0]).toBe('BOLD')
      expect(styles[1]).toBe('ITALIC')
    })
    it('Returns rich elements for a standard article', () => {
      const styles = pluck(Config.inlineStyles('standard'), 'name')

      expect(styles[0]).toBe('BOLD')
      expect(styles[1]).toBe('ITALIC')
      expect(styles[2]).toBe('STRIKETHROUGH')
    })
    it('Returns rich elements for a classic article', () => {
      const styles = pluck(Config.inlineStyles('classic'), 'name')

      expect(styles[0]).toBe('BOLD')
      expect(styles[1]).toBe('ITALIC')
    })
  })

  describe('#getRichElements', () => {
    it('Returns rich elements for a feature article', () => {
      const { blocks, blockMap, styles } = Config.getRichElements('feature', true)

      expect(blocks.length).toBe(5)
      expect(blockMap.size).toBe(7)
      expect(styles.length).toBe(2)
    })

    it('Returns correct decorators for a feature article', () => {
      const { _decorators } = Config.getRichElements('standard', true).decorators

      expect(_decorators.length).toBe(2)
      expect(_decorators[0].strategy).toBe(findLinkEntities)
      expect(_decorators[0].component).toBe(Link)
      expect(_decorators[1].strategy).toBe(findContentEndEntities)
      expect(_decorators[1].component).toBe(ContentEnd)
    })

    it('Returns rich elements for a standard article', () => {
      const { blocks, blockMap, styles } = Config.getRichElements('standard', true)

      expect(blocks.length).toBe(4)
      expect(blockMap.size).toBe(6)
      expect(styles.length).toBe(3)
    })

    it('Returns rich elements for a classic article with features', () => {
      const { blocks, blockMap, styles } = Config.getRichElements('classic', true)

      expect(blocks.length).toBe(5)
      expect(blockMap.size).toBe(6)
      expect(styles.length).toBe(2)
    })

    it('Returns rich elements for a classic article without features', () => {
      const { blocks, blockMap, styles } = Config.getRichElements('classic', false)

      expect(blocks.length).toBe(4)
      expect(blockMap.size).toBe(5)
      expect(styles.length).toBe(2)
    })
  })

  describe('#setEditorStateFromProps', () => {
    let body
    let section
    let props

    beforeEach(() => {
      body = '<h1>Hello. </h1><h3><em>Hello. </em></h3><blockquote>Hello. </blockquote><p><a href="artsy.net" class="is-follow-link">Hello. </a><span class="content-end"> </span></p>'
      section = { body }
      props = {
        section,
        hasFeatures: true
      }
    })

    it('Sets up editorState and formatted html for feature articles', () => {
      props.article = {layout: 'feature'}
      props.isContentEnd = true
      const { editorState, html } = Config.setEditorStateFromProps(props)

      expect(html).toMatch('<h1>Hello. </h1><h3><em>Hello. </em></h3><blockquote>Hello. </blockquote><p><span><a href="artsy.net" class="is-follow-link">Hello. </a><a class="entity-follow artist-follow"></a></span><span class="content-end"> </span></p>')
      expect(editorState.getCurrentContent().getPlainText()).toMatch('Hello.')
    })

    it('Sets up editorState and formatted html for standard articles', () => {
      props.article = {layout: 'standard'}
      props.isContentEnd = true
      const { editorState, html } = Config.setEditorStateFromProps(props)

      expect(html).toMatch('<p>Hello. </p><h3><em>Hello. </em></h3><blockquote>Hello. </blockquote><p><span><a href="artsy.net" class="is-follow-link">Hello. </a><a class="entity-follow artist-follow"></a></span><span class="content-end"> </span></p>')
      expect(editorState.getCurrentContent().getPlainText()).toMatch('Hello.')
    })

    it('Sets up editorState and formatted html for classic articles with features', () => {
      props.article = {layout: 'classic'}
      props.isContentEnd = true
      const { editorState, html } = Config.setEditorStateFromProps(props)

      expect(html).toMatch('<p>Hello. </p><h3>Hello. </h3><blockquote>Hello. </blockquote><p><span><a href="artsy.net" class="is-follow-link">Hello. </a><a class="entity-follow artist-follow"></a></span></p>')
      expect(html).not.toMatch('<span class="content-end">')
      expect(editorState.getCurrentContent().getPlainText()).toMatch('Hello.')
    })

    it('Sets up editorState and formatted html for classic articles without features', () => {
      props.article = {layout: 'classic'}
      props.hasFeatures = false
      const { editorState, html } = Config.setEditorStateFromProps(props)

      expect(html).toMatch('<p>Hello. </p><h3>Hello. </h3><p>Hello. </p><p><a href="artsy.net">Hello. </a></p>')
      expect(html).not.toMatch('<span class="content-end">')
      expect(editorState.getCurrentContent().getPlainText()).toMatch('Hello.')
    })

    it('Removes contentEnd if not props.isContentEnd', () => {
      props.article = {layout: 'standard'}
      const { html } = Config.setEditorStateFromProps(props)

      expect(html).toMatch('<p>Hello. </p><h3><em>Hello. </em></h3><blockquote>Hello. </blockquote><p><span><a href="artsy.net" class="is-follow-link">Hello. </a><a class="entity-follow artist-follow"></a></span></p>')
      expect(html).not.toMatch('<span class="content-end">')
    })

    it('Sets selection to start if editing', () => {
      props.article = {layout: 'standard'}
      props.editing = true
      const { editorState } = Config.setEditorStateFromProps(props)
      const { anchorOffset, hasFocus } = editorState.getSelection()

      expect(anchorOffset).toBe(0)
      expect(hasFocus).toBe(true)
    })

    it('Does not set selection if not editing', () => {
      props.article = {layout: 'standard'}
      const { editorState } = Config.setEditorStateFromProps(props)
      const { hasFocus } = editorState.getSelection()

      expect(hasFocus).toBe(false)
    })
  })
})
