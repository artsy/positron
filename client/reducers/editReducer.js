import u from 'updeep'
import { actions } from 'client/actions/editActions'

export const initialState = {
  activeSection: 'content',
  isSaving: false,
  isSaved: true
}

export function editReducer (state = initialState, action) {
  switch (action.type) {
    case actions.CHANGE_SAVED_STATUS: {
      return u({
        isSaving: false,
        isSaved: action.payload.isSaved
      }, state)
    }
    case actions.CHANGE_SECTION: {
      return u({
        activeSection: action.payload.activeSection
      }, state)
    }
    case actions.SAVE: {
      return u({
        isSaving: true
      }, state)
    }
  }

  return state
}
