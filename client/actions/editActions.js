import keyMirror from 'client/lib/keyMirror'

export const actions = keyMirror(
  'CHANGE_SAVED_STATUS',
  'CHANGE_SECTION',
  'DELETE_ARTICLE',
  'PUBLISH_ARTICLE',
  'SAVE_ARTICLE'
)

export const changeSavedStatus = (isSaved) => ({
  type: actions.CHANGE_SAVED_STATUS,
  payload: {
    isSaved
  }
})

export const changeSection = (activeSection) => ({
  type: actions.CHANGE_SECTION,
  payload: {
    activeSection
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

export const publishArticle = (article, published) => {
  article.set('published', published)
  article.save()
  article.trigger('finished')

  return {
    type: actions.PUBLISH_ARTICLE,
    payload: {
      isPublishing: true
    }
  }
}

export const saveArticle = (article) => {
  article.save()

  return {
    type: actions.SAVE_ARTICLE,
    payload: {
      isSaving: true
    }
  }
}
