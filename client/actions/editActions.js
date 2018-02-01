import keyMirror from 'client/lib/keyMirror'
import Article from 'client/models/article.coffee'

export const actions = keyMirror(
  'CHANGE_SAVED_STATUS',
  'CHANGE_VIEW',
  'DELETE_ARTICLE',
  'ERROR',
  'NEW_SECTION',
  'ON_CHANGE_SECTION',
  'ON_FIRST_SAVE',
  'PUBLISH_ARTICLE',
  'REDIRECT_TO_LIST',
  'REMOVE_SECTION',
  'RESET_SECTIONS',
  'SAVE_ARTICLE',
  'SET_SECTION',
  'TOGGLE_SPINNER'
)

export const changeSavedStatus = (article, isSaved) => {
  return {
    type: actions.CHANGE_SAVED_STATUS,
    payload: {
      article,
      isSaved,
      lastUpdated: new Date()
    }
  }
}

export const changeView = (activeView) => ({
  // Content, Admin, Display
  type: actions.CHANGE_VIEW,
  payload: {
    activeView
  }
})

export const deleteArticle = (article) => {
  article.destroy({
    success: () => {
      article.trigger('finished')
    }
  })

  return {
    type: actions.DELETE_ARTICLE,
    payload: {
      isDeleting: true
    }
  }
}

export const setSection = (sectionIndex) => ({
  // Index of article section currently editing
  type: actions.SET_SECTION,
  payload: {
    sectionIndex
  }
})

export const newSection = (type, sectionIndex) => {
  const section = setupSection(type)

  return {
    type: actions.NEW_SECTION,
    payload: {
      section,
      sectionIndex
    }
  }
}

export const onChangeSection = (key, value) => {
  return {
    type: actions.ON_CHANGE_SECTION,
    payload: {
      key,
      value
    }
  }
}

export const onFirstSave = (id) => {
  window.location.assign(`/articles/${id}/edit`)

  return {
    type: actions.ON_FIRST_SAVE
  }
}

export const publishArticle = (article, published) => {
  const newArticle = new Article(article)
  if (published) {
    setSeoKeyword(newArticle)
  }
  newArticle.set('published', published)
  newArticle.save()
  redirectToList(published)

  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true
    }
  }
}

export const redirectToList = (published) => {
  window.location.assign(`/articles?published=${published}`)

  return {
    type: actions.REDIRECT_TO_LIST
  }
}

export const removeSection = (sectionIndex) => ({
  type: actions.REMOVE_SECTION,
  payload: {
    sectionIndex
  }
})

export const resetSections = (sections) => ({
  type: actions.RESET_SECTIONS,
  payload: {
    sections
  }
})

export const saveArticle = () => {
  return (dispatch, getState) => {
    const article = getState().edit.article
    const newArticle = new Article(article)

    dispatch(saveArticlePending())

    newArticle.on('sync', () => {
      dispatch(changeSavedStatus(article, true))
    })

    setSeoKeyword(newArticle)
    newArticle.save()

    if (article.published) {
      redirectToList(true)
    }
  }
}

export const saveArticlePending = () => {
  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      isSaving: true
    }
  }
}

export const toggleSpinner = (isVisible) => {
  if (isVisible) {
    $('#edit-sections-spinner').show()
  } else {
    $('#edit-sections-spinner').hide()
  }

  return {
    type: actions.TOGGLE_SPINNER
  }
}

// EDITING ERRORS
export const logError = (error) => ({
  type: actions.ERROR,
  payload: {
    error
  }
})

export const resetError = () => ({
  type: actions.ERROR,
  payload: {
    error: null
  }
})

// ACTION UTILS
export function setupSection (type) {
  // set initial state of new section
  switch (type) {
    case 'video':
      return {
        type: 'video',
        url: '',
        layout: 'column_width'
      }
    case 'image_collection':
      return {
        type: 'image_collection',
        layout: 'overflow_fillwidth',
        images: []
      }
    case 'embed':
      return {
        type: 'embed',
        url: '',
        layout: 'column_width',
        height: ''
      }
    case 'text':
      return {
        type: 'text',
        body: ''
      }
  }
}

export const setSeoKeyword = (article) => {
  if (article.get('published')) {
    const seo_keyword = $('input#edit-seo__focus-keyword').val() || ''

    article.set({ seo_keyword })
  }
}
