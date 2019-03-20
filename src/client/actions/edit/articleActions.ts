import keyMirror from "client/lib/keyMirror"
const Article = require("client/models/article.coffee")
import { clone, cloneDeep, debounce, set } from "lodash"
import {
  debouncedUpdateDispatch,
  redirectToList,
} from "../../../client/actions/edit/editActions"

export const actions = keyMirror(
  "CHANGE_SAVED_STATUS",
  "CHANGE_ARTICLE",
  "DELETE_ARTICLE",
  "ON_FIRST_SAVE",
  "PUBLISH_ARTICLE",
  "SAVE_ARTICLE",
  "SET_MENTIONED_ITEMS",
  "SET_SEO_KEYWORD"
)

/**
 * Update isSaved, used to change colors of the the main UI save button
 * which renders in red (unsaved changes) or green (saved)
 */
export const changeSavedStatus = (article, isSaved: boolean) => {
  return {
    type: actions.CHANGE_SAVED_STATUS,
    payload: {
      article, // TODO: maybe not needed
      isSaved,
    },
  }
}

/**
 * Delete an article:
 * Converts article to Backbone article
 * Calls deleteArticlePending to indicate deletion in UI
 * Use Backbone's destroy to remove article
 * Redirects to /articles when deletion is complete
 */
export const deleteArticle = () => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const newArticle = new Article(article)

    dispatch(deleteArticlePending())
    newArticle.destroy({
      success: () => {
        dispatch(redirectToList(article.published))
      },
    })
  }
}

/**
 * A call has been made to the API to delete, when isDeleting is true
 * the main UI delete button renders 'Deleting...' as the button text
 */
export const deleteArticlePending = () => {
  return {
    type: actions.DELETE_ARTICLE,
    payload: {
      isDeleting: true,
    },
  }
}

/**
 * Debounces saveArticle to prevent overloading API requests
 */
export const debouncedSaveDispatch = debounce(dispatch => {
  dispatch(saveArticle())
}, 500)

/**
 * Replace existing article with a new article
 */
export const changeArticle = data => {
  return {
    type: actions.CHANGE_ARTICLE,
    payload: {
      data,
    },
  }
}

/**
 * Mutates article data
 * Data can be passed as a key/value pair or an object
 * Can also accept a nested object like 'hero_section.deck'
 * Nested objects can use only one level of depth
 */
export const changeArticleData = (key: any, value?: any) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    let data = {}

    if (typeof key === "object") {
      // extend article with an object of key
      data = key
    } else {
      const nestedObject = key.split(".")

      if (nestedObject.length > 1) {
        // change a nested object value
        const existingValue = clone(article[nestedObject[0]]) || {}
        data = set(existingValue, key, value)
      } else {
        // change a single key's value
        data[key] = value
      }
    }
    dispatch(changeArticle(data))
  }
}

/**
 * Actions for when article data is changed:
 * Calls changeArticleData to update the article
 * Calls debouncedUpdateDispatch to update article lockout status
 * If unpublished, call debouncedSaveDispatch to auto-save
 */
export const onChangeArticle = (key: any, value?: any) => {
  return (dispatch, getState) => {
    const {
      app: { channel },
      edit: { article },
    } = getState()

    dispatch(changeArticleData(key, value))

    debouncedUpdateDispatch(dispatch, { channel, article: article.id })

    if (!article.published) {
      debouncedSaveDispatch(dispatch)
    }
  }
}

/**
 * Redirects to the correct article route from /article/new
 * Called the first time saved data is present on the article
 */
export const onFirstSave = (id: string) => {
  window.location.assign(`/articles/${id}/edit`)

  return {
    type: actions.ON_FIRST_SAVE,
  }
}

/**
 * Publish/unpublish the article:
 * Calls publishArticlePending to indicate publishing has started in UI
 * Reverses published status of article
 * Create a new Backbone article with article data
 * Sets SEO keyword (Yoast) if new status is 'published'
 * Save the article
 * Maybe redirect to /articles
 */
export const publishArticle = () => {
  return (dispatch, getState) => {
    dispatch(publishArticlePending())
    const {
      edit: { article },
    } = getState()
    const published = !article.published
    const newArticle = new Article(article)

    newArticle.set({ published })
    if (published) {
      dispatch(setSeoKeyword(newArticle))
    }
    newArticle.save()

    dispatch(redirectToList(published))
  }
}

/**
 * A call has been made to the API to publish, when isPublishing is true
 * the main UI publish button renders 'Publishing...' as the button text
 */
export const publishArticlePending = () => {
  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true,
    },
  }
}

/**
 * Save the article:
 * Convert to backbone and call save
 * Calls saveArticlePending to indicate save status in UI
 * Changes saved status to indicate save is completed in UI
 * Calls onFirstSave to FWD to new route if article is new
 * Sets SEO keyword (Yoast)
 * Redirect to /articles if the article is published
 */
export const saveArticle = () => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const newArticle = new Article(article)
    dispatch(saveArticlePending())

    newArticle.on("sync", () => {
      dispatch(changeSavedStatus(article, true))
    })

    if (newArticle.isNew()) {
      newArticle.once("sync", () => {
        dispatch(onFirstSave(newArticle.id))
      })
    }

    dispatch(setSeoKeyword(newArticle))
    newArticle.save()

    if (article.published) {
      dispatch(redirectToList(true))
    }
  }
}

/**
 * A call has been made to the API to save, when isSaving is true
 * the main UI save button renders 'Saving...' as the button text
 */
export const saveArticlePending = () => {
  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      isSaving: true,
    },
  }
}

/**
 * Adds the id of a gravity artist or artwork to the appropriate
 * array on the article model, used in the Admin Panel UI
 *
 * Featuring an artist/artwork means that the article will be displayed
 * on the corresponding artist or artwork page.
 */
export const onAddFeaturedItem = (model: "artist" | "artwork", item: any) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const key =
      model === "artist"
        ? "primary_featured_artist_ids"
        : "featured_artwork_ids"
    const newFeaturedIds = cloneDeep(article)[key] || []

    newFeaturedIds.push(item._id)
    dispatch(changeArticleData(key, newFeaturedIds))
  }
}

/**
 * Stores gravity artists and artworks mentioned in the article
 * to display their names/titles in the Admin Panel UI
 */
export const setMentionedItems = (
  model: "artist" | "artwork",
  items: any[]
) => {
  return {
    type: actions.SET_MENTIONED_ITEMS,
    payload: {
      model,
      items,
    },
  }
}

/**
 * If a Yoast SEO Keyword is set, attach it to the article
 */
export const setSeoKeyword = article => {
  return (_dispatch, getState) => {
    const {
      edit: { yoastKeyword },
    } = getState()

    if (article.get("published")) {
      article.set({ seo_keyword: yoastKeyword })
    }
  }
}
