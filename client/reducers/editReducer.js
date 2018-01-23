import u from 'updeep'
import { data as sd } from 'sharify'
import { extend, pick } from 'lodash'
import { actions } from 'client/actions/editActions'

const setupArticle = () => {
  const article = sd.ARTICLE
  // strip deprecated handles from author
  const author = pick(article.author, 'id', 'name')

  return extend(article, { author })
}

export const initialState = {
  article: setupArticle(),
  activeSection: null,
  activeView: 'content',
  error: null,
  isDeleting: false,
  isPublishing: false,
  isSaving: false,
  isSaved: true,
  lastUpdated: null,
  section: null
}

export function editReducer (state = initialState, action) {
  switch (action.type) {
    case actions.CHANGE_SAVED_STATUS: {
      const article = extend(state.article, action.payload.article)

      return u({
        article,
        isSaving: false,
        isSaved: action.payload.isSaved,
        lastUpdated: action.payload.lastUpdated
      }, state)
    }

    case actions.EDIT_SECTION: {
      const { activeSection } = action.payload
      const { sections } = state.article
      const section = sections[activeSection] || null

      return u({
        activeSection,
        section
      }, state)
    }

    case actions.CHANGE_VIEW: {
      return u({
        activeView: action.payload.activeView
      }, state)
    }
    case actions.DELETE_ARTICLE: {
      return u({
        isDeleting: action.payload.isDeleting
      }, state)
    }
    case actions.ERROR: {
      return u({
        error: action.payload.error
      }, state)
    }
    case actions.NEW_SECTION: {
      return u({
        activeSection: state.article.sections.length,
        section: action.payload.section
      }, state)
    }
    case actions.PUBLISH_ARTICLE: {
      return u({
        isPublishing: action.payload.isPublishing
      }, state)
    }
    case actions.SAVE_ARTICLE: {
      return u({
        isSaving: true
      }, state)
    }
  }

  return state
}
