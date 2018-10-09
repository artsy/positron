import u from "updeep"
import { data as sd } from "sharify"
import { clone, cloneDeep, extend, pick } from "lodash"
import { actions } from "client/actions/edit"

export const setupArticle = () => {
  const article = sd.ARTICLE
  if (!article) {
    return null
  }

  // strip deprecated handles from author
  const author = pick(article.author, "id", "name")
  const author_id = sd.USER.id

  return extend(article, { author, author_id })
}

export const initialState = {
  activeView: "content",
  article: setupArticle(),
  currentSession: sd.CURRENT_SESSION,
  error: null,
  isDeleting: false,
  isPublishing: false,
  isSaving: false,
  isSaved: true,
  mentioned: {
    artist: [],
    artwork: [],
  },
  section: null,
  sectionIndex: null,
}

export function editReducer(state = initialState, action) {
  switch (action.type) {
    case actions.CHANGE_SAVED_STATUS: {
      const article = extend(state.article, action.payload.article)

      return u(
        {
          article,
          isSaving: false,
          isSaved: action.payload.isSaved,
        },
        state
      )
    }

    case actions.SET_SECTION: {
      const { sectionIndex } = action.payload
      const { sections } = state.article
      const section = clone(sections[sectionIndex]) || null

      return u(
        {
          sectionIndex,
          section,
        },
        state
      )
    }

    case actions.CHANGE_VIEW: {
      return u(
        {
          activeView: action.payload.activeView,
        },
        state
      )
    }

    case actions.CHANGE_ARTICLE: {
      const { data } = action.payload
      const article = extend(cloneDeep(state.article), data)

      return u(
        {
          article,
          isSaved: false,
        },
        state
      )
    }

    case actions.DELETE_ARTICLE: {
      return u(
        {
          isDeleting: action.payload.isDeleting,
        },
        state
      )
    }

    case actions.ERROR: {
      return u(
        {
          error: action.payload.error,
        },
        state
      )
    }

    case actions.NEW_SECTION: {
      const { section, sectionIndex } = action.payload
      const article = cloneDeep(state.article)

      if (article.sections) {
        article.sections.splice(sectionIndex, 0, section)
      } else {
        article.sections = [section]
      }

      return u(
        {
          article,
          sectionIndex,
          section,
        },
        state
      )
    }

    case actions.CHANGE_SECTION: {
      const { key, value } = action.payload
      const { sectionIndex } = state
      const article = cloneDeep(state.article)
      const section = cloneDeep(state.section)

      section[key] = value
      article.sections.splice(sectionIndex, 1, section)

      return u(
        {
          article,
          section,
          isSaved: false,
        },
        state
      )
    }

    case actions.PUBLISH_ARTICLE: {
      return u(
        {
          isPublishing: action.payload.isPublishing,
        },
        state
      )
    }

    case actions.SAVE_ARTICLE: {
      return u(
        {
          isSaving: true,
        },
        state
      )
    }

    case actions.SET_MENTIONED_ITEMS: {
      const mentioned = cloneDeep(state.mentioned)
      const { model, items } = action.payload
      mentioned[model] = items

      return u(
        {
          mentioned,
        },
        state
      )
    }
  }

  return state
}
