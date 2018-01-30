import { data as sd } from 'sharify'
import { clone } from 'lodash'
import { actions } from 'client/actions/articlesActions'
import { actions as editActions } from 'client/actions/editActions'

export const initialState = {
  articles: sd.ARTICLES,
  articlesInSession: sd.ARTICLES_IN_SESSION || {}
}

export function articlesReducer (state = initialState, action) {
  switch (action.type) {
    case actions.EDITED_ARTICLES_RECEIVED: {
      return {
        ...state,
        articlesInSession: action.payload
      }
    }
    case editActions.START_EDITING_ARTICLE: {
      const articlesInSession = clone(state.articlesInSession)
      const session = action.payload
      articlesInSession[session.article] = session

      return {
        ...state,
        articlesInSession
      }
    }
    case editActions.STOP_EDITING_ARTICLE: {
      const articlesInSession = clone(state.articlesInSession)
      delete articlesInSession[action.payload.article]

      return {
        ...state,
        articlesInSession
      }
    }
    default:
      return state
  }
}
