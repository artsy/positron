import * as editActions from '../editActions'
import Article from '../../models/article'
import { Fixtures } from '@artsy/reaction-force/dist/Components/Publishing'
const { FeatureArticle } = Fixtures

describe('editActions', () => {
  let article

  beforeEach(() => {
    article = new Article(FeatureArticle)
    article.destroy = jest.fn()
    article.save = jest.fn()
  })

  it('#changeSavedStatus updates article and sets isSaved to arg', () => {
    article.set('title', 'Cool article')
    const action = editActions.changeSavedStatus(article.attributes, true)

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

  it('#deleteArticle destroys the article and sets isDeleting', () => {
    const action = editActions.deleteArticle(article)

    expect(action.type).toBe('DELETE_ARTICLE')
    expect(action.payload.isDeleting).toBe(true)
    expect(article.destroy.mock.calls.length).toBe(1)
  })

  it('#publishArticle changes the publish status and saves the article', () => {
    const action = editActions.publishArticle(article)

    expect(action.type).toBe('PUBLISH_ARTICLE')
    expect(action.payload.isPublishing).toBe(!article.get('published'))
    expect(article.save.mock.calls.length).toBe(1)
  })

  it('#saveArticle sets isSaving to true and saves the article', () => {
    const action = editActions.saveArticle(article)

    expect(action.type).toBe('SAVE_ARTICLE')
    expect(action.payload.isSaving).toBe(true)
    expect(article.save.mock.calls.length).toBe(1)
  })

  describe('#newSection', () => {
    it('Can create an embed section', () => {
      const action = editActions.newSection('embed')
      const { section } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('embed')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
      expect(section.height).toBe('')
    })

    it('Can create an image_collection section', () => {
      const action = editActions.newSection('image_collection')
      const { section } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('image_collection')
      expect(section.images.length).toBe(0)
      expect(section.layout).toBe('overflow_fillwidth')
    })

    it('Can create a text section', () => {
      const action = editActions.newSection('text')
      const { section } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe('')
    })

    it('Can create a video section', () => {
      const action = editActions.newSection('video')
      const { section } = action.payload

      expect(action.type).toBe('NEW_SECTION')
      expect(section.type).toBe('video')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
    })
  })

  it('#removeSection sets sectionIndex to index', () => {
    const action = editActions.removeSection(6)

    expect(action.type).toBe('REMOVE_SECTION')
    expect(action.payload.sectionIndex).toBe(6)
  })

  it('#resetSections sets sections to arg', () => {
    const newSections = FeatureArticle.sections.slice(1, 0)
    const action = editActions.resetSections(newSections)

    expect(action.type).toBe('RESET_SECTIONS')
    expect(action.payload.sections).toBe(newSections)
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
