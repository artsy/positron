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
import { clean, stripTags } from "underscore.string"

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
 * Accepts two strings of html, replaces the section currently
 * being edited with two text sections
 */
export const onSplitTextSection = (
  existingSectionBody: string,
  newSectionBody: string
) => {
  return (dispatch, getState) => {
    const {
      edit: { article, sectionIndex },
    } = getState()
    // update original section with updated content
    dispatch(onChangeSection("body", existingSectionBody))
    dispatch(newSection("text", sectionIndex + 1, { body: newSectionBody }))

    if (!article.published) {
      debouncedSaveDispatch(dispatch)
    }
  }
}

/**
 * Replaces current section html with newHtml arg and deletes previous section
 * Called only from inside #maybeMergeTextSections to ensure that action is allowed
 */
export const onMergeTextSections = (newHtml: string) => {
  return (dispatch, getState) => {
    const {
      edit: { sectionIndex },
    } = getState()
    dispatch(onChangeSection("body", newHtml))
    dispatch(removeSection(sectionIndex - 1))
  }
}

/**
 * Checks if section before currently edited section is of type text and
 * if so, merges content of sections together
 *
 * Also removes blockquotes to ensure that new section does not combine
 * disallowed block types (all blockquotes must exist in their own section
 * because they are rendered at a wider width than other text blocks)
 */
export const maybeMergeTextSections = () => {
  return (dispatch, getState) => {
    const {
      edit: {
        article: { sections },
        section,
        sectionIndex,
      },
    } = getState()
    if (sections.length && sectionIndex !== 0) {
      const sectionBefore = sections[sectionIndex - 1]
      const sectionBeforeIsText = sectionBefore && sectionBefore.type === "text"

      if (sectionBeforeIsText) {
        const newHtml = sectionBefore.body + section.body
        const strippedHtml = newHtml
          .replace("<blockquote>", "<p>")
          .replace("</blockquote>", "</p>")
        dispatch(onMergeTextSections(strippedHtml))
      }
    }
  }
}

/**
 * To ensure that all blockquotes are confined to their own section,
 * insert new sections before or after changed text block when necessary
 *
 * sets currently editing section to null to ensure all draftjs states are refreshed
 */
export const onInsertBlockquote = (
  blockquoteHtml: string,
  beforeHtml: string,
  afterHtml: string
) => {
  return (dispatch, getState) => {
    const {
      edit: { article, sectionIndex },
    } = getState()

    dispatch(onChangeSection("body", blockquoteHtml))
    if (afterHtml) {
      // insert a section after if html is provided
      dispatch(newSection("text", sectionIndex + 1, { body: afterHtml }))
    }
    if (beforeHtml) {
      // insert a section before if html is provided
      dispatch(newSection("text", sectionIndex, { body: beforeHtml }))
    }
    if ((beforeHtml || afterHtml) && !article.published) {
      debouncedSaveDispatch(dispatch)
    }
    dispatch(setSection(null))
  }
}

/**
 * Check section.body to ensure that html will render text. If html is empty or
 * blocktype is h1 (an allowed placeholder), will strip spaces from h1
 */
export const maybeRemoveEmptyText = (sectionIndex: number) => {
  return (dispatch, getState) => {
    const {
      edit: { article },
    } = getState()
    const newArticle = cloneDeep(article)
    const activeSection = newArticle.sections[sectionIndex]
    const isText = activeSection.type === "text"

    if (!isText) {
      // No action necessary if section is not text
      return
    } else {
      const isEmptyHtml = !clean(stripTags(activeSection.body)).length
      const isEmptyH1 = isEmptyHtml && activeSection.body.includes("<h1>")

      if (!isEmptyHtml) {
        // No action necessary if text is present
        return
      } else if (isEmptyH1) {
        // Preserve empty H1 as section divider
        newArticle.sections[sectionIndex].body = "<h1></h1>"
        dispatch(onChangeArticle("sections", newArticle.sections))
      } else {
        // Remove text sections with empty body
        dispatch(removeSection(sectionIndex))
      }
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
