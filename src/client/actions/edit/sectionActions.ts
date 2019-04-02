import {
  SectionData,
  SectionType,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  changeArticleData,
  debouncedSaveDispatch,
  onChangeArticle,
} from "client/actions/edit/articleActions"
import keyMirror from "client/lib/keyMirror"
import { clone, cloneDeep } from "lodash"

export const actions = keyMirror(
  "CHANGE_SECTION",
  "NEW_SECTION",
  "REMOVE_SECTION",
  "SET_SECTION"
)

/**
 * Actions related to changing data in an article section via the edit/content app
 */

/**
 * Mutate section data based on key/val pair
 */
export const changeSection = (key: string, value: any) => {
  return {
    type: actions.CHANGE_SECTION,
    payload: {
      key,
      value,
    },
  }
}

/**
 * Adds a new hero (header) section, setupSection applies
 * default section data based on arg type
 */
export const newHeroSection = (type: SectionType) => {
  const section = setupSection(type)

  return (dispatch, _getState) => {
    dispatch(changeArticleData("hero_section", section))
  }
}

/**
 * Add a new section to article.sections array based on type
 * optionally pass attrs to include data in the new section
 * setupSection applies default section data based on arg type
 * returns text section by default
 */
export const newSection = (type: SectionType, sectionIndex, attrs = {}) => {
  const section = { ...setupSection(type), ...attrs } as SectionData

  return {
    type: actions.NEW_SECTION,
    payload: {
      section,
      sectionIndex,
    },
  }
}

/**
 * Change data in article.hero_section
 */
export const onChangeHero = (key: string, value: any) => {
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

/**
 * Change data for an individual section from the article.sections array
 */
export const onChangeSection = (key: string, value: any) => {
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

/**
 * Removes a section from the article.sections array
 */
export const removeSection = (sectionIndex: number) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const newArticle = cloneDeep(article)

    newArticle.sections.splice(sectionIndex, 1)
    dispatch(onChangeArticle("sections", newArticle.sections))
  }
}

/**
 * Sets the index of the section a user is currently editing to app state
 * When null, no section is being edited
 */
export const setSection = (sectionIndex: number | null) => ({
  type: actions.SET_SECTION,
  payload: {
    sectionIndex,
  },
})

/**
 * Sets up default data for an empty section based on arg type
 */
export const setupSection = (type: SectionType = "text") => {
  // set initial state of new section
  switch (type) {
    case "video":
      return {
        type: "video",
        url: "",
        layout: "column_width",
      } as SectionData
    case "image_collection":
      return {
        type: "image_collection",
        layout: "overflow_fillwidth",
        images: [],
      } as SectionData
    case "embed":
      return {
        type: "embed",
        url: "",
        layout: "column_width",
        height: 0,
      } as SectionData
    case "social_embed":
      return {
        type: "social_embed",
        url: "",
        layout: "column_width",
      } as SectionData
    default:
      return {
        type: "text",
        body: "",
      } as SectionData
  }
}
