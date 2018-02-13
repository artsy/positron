import u from 'updeep'
import { data as sd } from 'sharify'
import { cloneDeep } from 'lodash'
import { actions } from 'client/actions/articlesActions'
import { actions as editActions } from 'client/actions/editActions'

export const initialState = {
  articles: sd.ARTICLES,
  articlesInSession: sd.ARTICLES_IN_SESSION || {}
}

export function articlesReducer (state = initialState, action) {
  switch (action.type) {
    case actions.EDITED_ARTICLES_RECEIVED: {
      return u({
        articlesInSession: action.payload
      }, state)
    }
    case editActions.START_EDITING_ARTICLE: {
      const articlesInSession = cloneDeep(state.articlesInSession)
      const session = action.payload
      articlesInSession[session.article] = session

      return u({
        articlesInSession
      }, state)
    }
    case editActions.STOP_EDITING_ARTICLE: {
      const articlesInSession = cloneDeep(state.articlesInSession)
      delete articlesInSession[action.payload.article]

      return u({
        articlesInSession
      }, state)
    }
    default:
      return state
  }
}
