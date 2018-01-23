import { editReducer } from '../editReducer'
import {
  FeatureArticle
} from '@artsy/reaction-force/dist/Components/Publishing/Fixtures/Articles'

describe('editReducer', () => {
  it('should return the initial state', () => {
    const initialState = editReducer(undefined, {})

    expect(initialState.article).toBe(FeatureArticle)
    expect(initialState.activeSection).toBe(null)
    expect(initialState.activeView).toBe('content')
    expect(initialState.error).toBe(null)
    expect(initialState.isDeleting).toBe(false)
    expect(initialState.isPublishing).toBe(false)
    expect(initialState.isSaving).toBe(false)
    expect(initialState.isSaved).toBe(true)
    expect(initialState.lastUpdated).toBe(null)
    expect(initialState.section).toBe(null)
  })
})
