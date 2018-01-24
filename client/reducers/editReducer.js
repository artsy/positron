import u from 'updeep'
import { data as sd } from 'sharify'
import { clone, cloneDeep, extend, pick } from 'lodash'
import { actions } from 'client/actions/editActions'

const setupArticle = () => {
  const article = sd.ARTICLE
  // strip deprecated handles from author
  const author = pick(article.author, 'id', 'name')

  return extend(article, { author })
}

export const initialState = {
  article: setupArticle(),
  sectionIndex: null,
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

    case actions.SET_SECTION: {
      const { sectionIndex } = action.payload
      const { sections } = state.article
      const section = clone(sections[sectionIndex]) || null

      return u({
        sectionIndex,
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
      const { section, sectionIndex } = action.payload
      const article = cloneDeep(state.article)

      article.sections.splice(sectionIndex, 0, section)
      return u({
        article,
        sectionIndex,
        section
      }, state)
    }

    case actions.ON_CHANGE_SECTION: {
      const { key, value } = action.payload
      const { sectionIndex } = state
      const article = cloneDeep(state.article)
      const section = cloneDeep(state.section)

      section[key] = value
      article.sections.splice(sectionIndex, 1, section)

      return u({
        article,
        section
      }, state)
    }

    case actions.PUBLISH_ARTICLE: {
      return u({
        isPublishing: action.payload.isPublishing
      }, state)
    }

    case actions.REMOVE_SECTION: {
      const { sectionIndex } = action.payload
      const article = cloneDeep(state.article)

      article.sections.splice(sectionIndex, 1)
      return u({
        article,
        sectionIndex: null,
        section: null
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
