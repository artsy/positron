import { clone, cloneDeep } from "lodash"
import keyMirror from "client/lib/keyMirror"
import {
  changeArticleData,
  debouncedSaveDispatch,
  onChangeArticle,
} from "client/actions/edit/articleActions"

export const actions = keyMirror(
  "CHANGE_SECTION",
  "NEW_SECTION",
  "REMOVE_SECTION",
  "SET_SECTION"
)

export const changeSection = (key, value) => {
  return {
    type: actions.CHANGE_SECTION,
    payload: {
      key,
      value,
    },
  }
}

export const newHeroSection = type => {
  const section = setupSection(type)

  return (dispatch, getState) => {
    dispatch(changeArticleData("hero_section", section))
  }
}

export const newSection = (type, sectionIndex, attrs = {}) => {
  const section = { ...setupSection(type), ...attrs }

  return {
    type: actions.NEW_SECTION,
    payload: {
      section,
      sectionIndex,
    },
  }
}

export const onChangeHero = (key, value) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const hero_section = clone(article.hero_section) || {}

    hero_section[key] = value
    dispatch(changeArticleData("hero_section", hero_section))

    if (!article.published) {
      debouncedSaveDispatch(dispatch)
    }
  }
}

export const onChangeSection = (key, value) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()

    dispatch(changeSection(key, value))

    if (!article.published) {
      debouncedSaveDispatch(dispatch)
    }
  }
}

export const removeSection = sectionIndex => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const newArticle = cloneDeep(article)

    newArticle.sections.splice(sectionIndex, 1)
    dispatch(onChangeArticle("sections", newArticle.sections))
  }
}

export const setSection = sectionIndex => ({
  // Index of article section currently editing
  type: actions.SET_SECTION,
  payload: {
    sectionIndex,
  },
})

export const setupSection = type => {
  // set initial state of new section
  switch (type) {
    case "video":
      return {
        type: "video",
        url: "",
        layout: "column_width",
      }
    case "image_collection":
      return {
        type: "image_collection",
        layout: "overflow_fillwidth",
        images: [],
      }
    case "embed":
      return {
        type: "embed",
        url: "",
        layout: "column_width",
        height: "",
      }
    case "social_embed":
      return {
        type: "social_embed",
        url: "",
        layout: "column_width",
      }
    case "text":
      return {
        type: "text",
        body: "",
      }
    case "blockquote":
      return {
        type: "text",
        body: "",
        layout: "blockquote",
      }
  }
}
