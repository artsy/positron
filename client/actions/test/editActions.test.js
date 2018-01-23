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
    const changeSavedStatus = editActions.changeSavedStatus(article.attributes, true)

    expect(changeSavedStatus.type).toBe('CHANGE_SAVED_STATUS')
    expect(changeSavedStatus.payload.isSaved).toBe(true)
    expect(changeSavedStatus.payload.article.title).toBe('Cool article')
  })

  it('#editSection sets activeSection to index and sets state.section', () => {
    const editSection = editActions.editSection(6)

    expect(editSection.type).toBe('EDIT_SECTION')
    expect(editSection.payload.activeSection).toBe(6)
  })

  it('#changeView sets the activeView to arg', () => {
    const changeView = editActions.changeView('display')

    expect(changeView.type).toBe('CHANGE_VIEW')
    expect(changeView.payload.activeView).toBe('display')
  })

  it('#deleteArticle destroys the article and sets isDeleting', () => {
    const deleteArticle = editActions.deleteArticle(article)

    expect(deleteArticle.type).toBe('DELETE_ARTICLE')
    expect(deleteArticle.payload.isDeleting).toBe(true)
    expect(article.destroy.mock.calls.length).toBe(1)
  })

  it('#publishArticle changes the publish status and saves the article', () => {
    const publishArticle = editActions.publishArticle(article)

    expect(publishArticle.type).toBe('PUBLISH_ARTICLE')
    expect(publishArticle.payload.isPublishing).toBe(!article.get('published'))
    expect(article.save.mock.calls.length).toBe(1)
  })

  it('#saveArticle sets isSaving to true and saves the article', () => {
    const saveArticle = editActions.saveArticle(article)

    expect(saveArticle.type).toBe('SAVE_ARTICLE')
    expect(saveArticle.payload.isSaving).toBe(true)
    expect(article.save.mock.calls.length).toBe(1)
  })

  describe('#newSection', () => {
    it('Can create an embed section', () => {
      const newSection = editActions.newSection('embed')
      const { section } = newSection.payload

      expect(newSection.type).toBe('NEW_SECTION')
      expect(section.type).toBe('embed')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
      expect(section.height).toBe('')
    })

    it('Can create an image_collection section', () => {
      const newSection = editActions.newSection('image_collection')
      const { section } = newSection.payload

      expect(newSection.type).toBe('NEW_SECTION')
      expect(section.type).toBe('image_collection')
      expect(section.images.length).toBe(0)
      expect(section.layout).toBe('overflow_fillwidth')
    })

    it('Can create a text section', () => {
      const newSection = editActions.newSection('text')
      const { section } = newSection.payload

      expect(newSection.type).toBe('NEW_SECTION')
      expect(section.type).toBe('text')
      expect(section.body).toBe('')
    })

    it('Can create a video section', () => {
      const newSection = editActions.newSection('video')
      const { section } = newSection.payload

      expect(newSection.type).toBe('NEW_SECTION')
      expect(section.type).toBe('video')
      expect(section.url).toBe('')
      expect(section.layout).toBe('column_width')
    })
  })

  describe('Editing errors', () => {
    it('#logError sets error to arg', () => {
      const message = 'Error message'
      const logError = editActions.logError({ message })

      expect(logError.type).toBe('ERROR')
      expect(logError.payload.error.message).toBe(message)
    })

    it('#resetError sets error to null', () => {
      const message = 'Error message'
      const resetError = editActions.resetError({ message })

      expect(resetError.type).toBe('ERROR')
      expect(resetError.payload.error).toBe(null)
    })
  })
})
