import { clone, extend } from 'lodash'
import { editReducer } from '../editReducer2'
import { actions, setupSection } from '../../actions/editActions2'
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
    it('SET_SECTION adds editing section and sectionIndex to state', () => {
      const sectionIndex = 2
      const updatedState = editReducer(initialState, {
        type: actions.SET_SECTION,
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

    it('CHANGE_SECTION should update section keys and reset article.sections', () => {
      const stateWithSection = extend(initialState, {
        section: initialSections[0],
        sectionIndex: 0
      })
      const key = 'body'
      const value = '<p>A new piece of text.</p>'

      const updatedState = editReducer(stateWithSection, {
        type: actions.CHANGE_SECTION,
        payload: {
          key,
          value
        }
      })

      expect(updatedState.section.body).toBe(value)
      expect(updatedState.article.sections[0].body).toBe(value)
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

    it('RESET_SECTIONS should reset the sections to provided array', () => {
      const sections = initialSections.slice(1, 3)
      const article = { sections }
      const updatedState = editReducer(initialState, {
        type: actions.RESET_SECTIONS,
        payload: {
          article
        }
      })
      expect(updatedState.article.sections).toEqual(sections)
    })
  })
})
