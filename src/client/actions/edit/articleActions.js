import { clone, cloneDeep, debounce, set } from "lodash"
import keyMirror from "client/lib/keyMirror"
import Article from "client/models/article.coffee"
import {
  redirectToList,
  debouncedUpdateDispatch,
} from "client/actions/edit/editActions"
import $ from "jquery"

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

export const changeSavedStatus = (article, isSaved) => {
  return {
    type: actions.CHANGE_SAVED_STATUS,
    payload: {
      article,
      isSaved,
    },
  }
}

export const deleteArticle = (key, value) => {
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

export const deleteArticlePending = () => {
  return {
    type: actions.DELETE_ARTICLE,
    payload: {
      isDeleting: true,
    },
  }
}

export const debouncedSaveDispatch = debounce(dispatch => {
  dispatch(saveArticle())
}, 500)

export const changeArticle = data => {
  return {
    type: actions.CHANGE_ARTICLE,
    payload: {
      data,
    },
  }
}

export const changeArticleData = (key, value) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    let data = {}

    if (typeof key === "object") {
      // extend article with an object of key
      data = key
    } else {
      let nestedObject = key.split(".")

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

export const onChangeArticle = (key, value) => {
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

export const onFirstSave = id => {
  window.location.assign(`/articles/${id}/edit`)

  return {
    type: actions.ON_FIRST_SAVE,
  }
}

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

export const publishArticlePending = () => {
  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true,
    },
  }
}

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

export const saveArticlePending = () => {
  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      isSaving: true,
    },
  }
}

// FEATURED + MENTIONED
export const onAddFeaturedItem = (model, item) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const key =
      model === "artist"
        ? "primary_featured_artist_ids"
        : "featured_artwork_ids"
    let newFeaturedIds = cloneDeep(article)[key] || []

    newFeaturedIds.push(item._id)
    dispatch(changeArticleData(key, newFeaturedIds))
  }
}

export const setMentionedItems = (model, items) => {
  return {
    type: actions.SET_MENTIONED_ITEMS,
    payload: {
      model,
      items,
    },
  }
}

// YOAST
export const setSeoKeyword = article => {
  if (article.get("published")) {
    const seo_keyword = document.getElementById("focus-keyword").value || ""
    article.set({ seo_keyword })
  }
  return {
    type: actions.SET_SEO_KEYWORD,
  }
}
