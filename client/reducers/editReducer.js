import u from 'updeep'
import { actions } from 'client/actions/editActions'

export const initialState = {
  isEditing: false
}

export function editReducer (state = initialState, action) {
  switch (action.type) {
    case actions.EDIT: {
      console.log('edit!')
      return u({
        isEditing: action.payload.isEditing
      }, state)
    }
  }

  return state
}
