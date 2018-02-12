import * as editActions from '../editActions2'
import { clone } from 'lodash'
import Backbone from 'backbone'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
import Article from 'client/models/article.coffee'
const { FeatureArticle } = Fixtures

describe('editActions', () => {
  let article

  beforeEach(() => {
    window.location.assign = jest.fn()
    article = clone(FeatureArticle)
  })

  document.body.innerHTML = `
    <div>
      <div id="edit-sections-spinner" />
      <input id="edit-seo__focus-keyword" value="ceramics" />
    </div>'
  `

  it('#changeSavedStatus updates article and sets isSaved to arg', () => {
    article.title = 'Cool article'
    const action = editActions.changeSavedStatus(article, true)

    expect(action.type).toBe('CHANGE_SAVED_STATUS')
    expect(action.payload.isSaved).toBe(true)
    expect(action.payload.article.title).toBe('Cool article')
  })

  it('#setSection sets sectionIndex to arg', () => {
    const action = editActions.setSection(6)

    expect(action.type).toBe('SET_SECTION')
    expect(action.payload.sectionIndex).toBe(6)
  })

  it('#changeView sets the activeView to arg', () => {
    const action = editActions.changeView('display')

    expect(action.type).toBe('CHANGE_VIEW')
    expect(action.payload.activeView).toBe('display')
  })

  it('#redirectToList forwards to the articles list with published arg', () => {
    editActions.redirectToList(true)
    expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=true')

    editActions.redirectToList(false)
    expect(window.location.assign.mock.calls[1][0]).toBe('/articles?published=false')
  })

  it('#onFirstSave forwards to the article url', () => {
    editActions.onFirstSave('12345')

    expect(window.location.assign.mock.calls[0][0]).toBe('/articles/12345/edit')
  })

  it('#toggleSpinner shows/hides the loading spinner based on arg', () => {
    editActions.toggleSpinner(false)
    expect($('#edit-sections-spinner').css('display')).toBe('none')

    editActions.toggleSpinner(true)
    expect($('#edit-sections-spinner').css('display')).toBe('block')
  })

  describe('#deleteArticle', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('#deleteArticle destroys the article and sets isDeleting', () => {
      editActions.deleteArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('DELETE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.isDeleting).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe('delete')
    })
  })

  describe('#saveArticle', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('Sets isSaving to true and saves the article', () => {
      editActions.saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('SAVE_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.isSaving).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe('update')
    })

    it('Redirects to list if published', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[2][0].type).toBe('REDIRECT_TO_LIST')
      expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=true')
    })

    it('Does not redirect if unpublished', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.saveArticle()(dispatch, getState)

      expect(window.location.assign.mock.calls.length).toBe(0)
    })

    it('Sets seo_keyword if published', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.saveArticle()(dispatch, getState)
      expect(dispatch.mock.calls[1][0].type).toBe('SET_SEO_KEYWORD')
      expect(setArticleSpy.mock.calls[1][0].seo_keyword).toBe('ceramics')
    })

    it('Does not seo_keyword if unpublished', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.saveArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('SET_SEO_KEYWORD')
      expect(setArticleSpy.mock.calls.length).toBe(1)
      expect(setArticleSpy.mock.calls[0][0].seo_keyword).toBeFalsy()
    })
  })

  describe('#publishArticle', () => {
    let getState
    let dispatch
    let setArticleSpy = jest.spyOn(Article.prototype, 'set')

    beforeEach(() => {
      setArticleSpy.mockClear()
      Backbone.sync = jest.fn()
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('Changes the publish status and saves the article', () => {
      getState = jest.fn(() => ({edit: {article: {published: false, id: '123'}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('PUBLISH_ARTICLE')
      expect(dispatch.mock.calls[0][0].payload.isPublishing).toBe(true)
      expect(Backbone.sync.mock.calls[0][0]).toBe('update')
      expect(Backbone.sync.mock.calls[0][1].get('published')).toBe(true)
    })

    it('Sets seo_keyword if publishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('SET_SEO_KEYWORD')
      expect(setArticleSpy.mock.calls[2][0].seo_keyword).toBe('ceramics')
    })

    it('Does not seo_keyword if unpublishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('REDIRECT_TO_LIST')
      expect(Backbone.sync.mock.calls[0][1].get('seo_keyword')).toBeFalsy()
    })

    it('Redirects to published list if publishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: false}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[2][0].type).toBe('REDIRECT_TO_LIST')
      expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=true')
    })

    it('Redirects to drafts list if unpublishing', () => {
      getState = jest.fn(() => ({edit: {article: {published: true}}}))
      editActions.publishArticle()(dispatch, getState)

      expect(dispatch.mock.calls[1][0].type).toBe('REDIRECT_TO_LIST')
      expect(window.location.assign.mock.calls[0][0]).toBe('/articles?published=false')
    })
  })

  describe('#newSection', () => {
    it('Can create an embed section', () => {
      const action = editActions.newSection('embed', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('embed')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
      expect(section.height).toBe('')
      expect(sectionIndex).toBe(3)
    })

    it('Can create an image_collection section', () => {
      const action = editActions.newSection('image_collection', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('image_collection')
      expect(section.images.length).toBe(0)
      expect(section.layout).toBe('overflow_fillwidth')
      expect(sectionIndex).toBe(3)
    })

    it('Can create a text section', () => {
      const action = editActions.newSection('text', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe('')
      expect(sectionIndex).toBe(3)
    })

    it('Can create a blockquote section', () => {
      const action = editActions.newSection('blockquote', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe('')
      expect(section.layout).toBe('blockquote')
      expect(sectionIndex).toBe(3)
    })

    it('Can create a video section', () => {
      const action = editActions.newSection('video', 3)
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('video')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
      expect(sectionIndex).toBe(3)
    })

    it('Can add attributes to a new section', () => {
      const body = '<p>The Precarious, Glamorous Lives of Independent Curators</p>'
      const action = editActions.newSection('blockquote', 3, { body })
      const { section, sectionIndex } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe(body)
      expect(section.layout).toBe('blockquote')
      expect(sectionIndex).toBe(3)
    })
  })

  it('#removeSection sets sectionIndex to index', () => {
    const action = editActions.removeSection(6)

    expect(action.type).toBe('REMOVE_SECTION')
    expect(action.payload.sectionIndex).toBe(6)
  })
  describe('#publishArticle', () => {
    let getState
    let dispatch

    beforeEach(() => {
      getState = jest.fn(() => ({edit: { article }}))
      dispatch = jest.fn()
    })

    it('#resetSections sets sections to arg', () => {
      const sections = [{title: 'Cool exhibition'}]
      getState = jest.fn((article) => ({edit: {article: {published: false}}}))
      editActions.resetSections(sections)(dispatch, getState)

      expect(dispatch.mock.calls[0][0].type).toBe('RESET_SECTIONS')
      expect(dispatch.mock.calls[0][0].payload.article.sections).toBe(sections)
    })
  })

  describe('Editing errors', () => {
    it('#logError sets error to arg', () => {
      const message = 'Error message'
      const action = editActions.logError({ message })

      expect(action.type).toBe('ERROR')
      expect(action.payload.error.message).toBe(message)
    })

    it('#resetError sets error to null', () => {
      const message = 'Error message'
      const action = editActions.resetError({ message })

      expect(action.type).toBe('ERROR')
      expect(action.payload.error).toBe(null)
    })
  })
})
