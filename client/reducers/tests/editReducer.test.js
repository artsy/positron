import { clone } from 'lodash'
import { editReducer } from '../editReducer'
import { actions, setupSection } from '../../actions/editActions'
import {
  FeatureArticle
} from '@artsy/reaction-force/dist/Components/Publishing/Fixtures/Articles'

describe('editReducer', () => {
  let initialState
  let initialSections

  beforeEach(() => {
    initialState = editReducer(undefined, {})
    initialSections = clone(FeatureArticle.sections)
  })

  it('should return the initial state', () => {
    expect(initialState.article).toEqual(FeatureArticle)
    expect(initialState.activeView).toBe('content')
    expect(initialState.error).toBe(null)
    expect(initialState.isDeleting).toBe(false)
    expect(initialState.isPublishing).toBe(false)
    expect(initialState.isSaving).toBe(false)
    expect(initialState.isSaved).toBe(true)
    expect(initialState.lastUpdated).toBe(null)
    expect(initialState.section).toBe(null)
    expect(initialState.sectionIndex).toBe(null)
  })

  describe('Sections', () => {
    it('EDIT_SECTION adds editing section and sectionIndex to state', () => {
      const sectionIndex = 2
      const updatedState = editReducer(initialState, {
        type: actions.EDIT_SECTION,
        payload: {
          sectionIndex
        }
      })
      expect(updatedState.sectionIndex).toBe(sectionIndex)
      expect(updatedState.section).toEqual(initialSections[sectionIndex])
    })

    it('NEW_SECTION should insert a section into article.sections', () => {
      const section = setupSection('text')
      const sectionIndex = 2

      const updatedState = editReducer(initialState, {
        type: actions.NEW_SECTION,
        payload: {
          section,
          sectionIndex
        }
      })

      expect(updatedState.sectionIndex).toBe(sectionIndex)
      expect(updatedState.section.type).toBe(section.type)
      expect(updatedState.section.body).toBe(section.body)
      expect(updatedState.article.sections[sectionIndex]).toBe(section)
      expect(updatedState.article.sections[3]).toEqual(
        initialSections[2]
      )
      expect(updatedState.article.sections.length).toBe(
        initialSections.length + 1
      )
    })

    it('REMOVE_SECTION should remove a section by index', () => {
      const sectionIndex = 2
      const updatedState = editReducer(initialState, {
        type: actions.REMOVE_SECTION,
        payload: {
          sectionIndex
        }
      })
      expect(updatedState.section).toBe(null)
      expect(updatedState.sectionIndex).toBe(null)
      expect(updatedState.article.sections.length).toBe(
        initialSections.length - 1
      )
      expect(updatedState.article.sections[2]).not.toEqual(
        initialSections[2]
      )
    })
  })
})
