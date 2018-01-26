import u from 'updeep'
import { data as sd } from 'sharify'
import { actions } from 'client/actions/articlesActions'

export const initialState = {
  articles: sd.ARTICLES
}

export function articlesReducer (state = initialState, action) {
  switch (action.type) {
    case actions.EDITED_ARTICLES_RECEIVED: {
      return {
        ...state,
        articlesInSession: action.payload
      }
    }
    default:
      return state
  }
}
