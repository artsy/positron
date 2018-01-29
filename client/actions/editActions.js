import keyMirror from 'client/lib/keyMirror'

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
  'SAVE_ARTICLE',
  'SET_SECTION',
  'TOGGLE_SPINNER'
)

export const changeSavedStatus = (article, isSaved) => ({
  type: actions.CHANGE_SAVED_STATUS,
  payload: {
    article,
    isSaved,
    lastUpdated: new Date()
  }
})

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
  location.assign(`/articles/${id}/edit`)

  return {
    type: actions.ON_FIRST_SAVE
  }
}

export const publishArticle = (article, published) => {
  if (published) {
    setSeoKeyword(article)
  }
  article.set('published', published)
  article.save()
  redirectToList(published)

  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true
    }
  }
}

export const redirectToList = (published) => {
  location.assign(`/articles?published=${published}`)

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

export const saveArticle = (article) => {
  setSeoKeyword(article)
  article.save()

  if (article.get('published')) {
    redirectToList(true)
  }
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

export function setSeoKeyword (article) {
  if (article.get('published')) {
    const seo_keyword = $('input#edit-seo__focus-keyword').val()

    article.set({ seo_keyword })
  }
}
