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

  return (dispatch, _getState) => {
    dispatch(changeArticleData("hero_section", section))
  }
}

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

export const onSplitTextSection = (existingSectionBody, newSectionBody) => {
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

export const onMergeTextSections = newHtml => {
  return (dispatch, getState) => {
    const {
      edit: { sectionIndex },
    } = getState()
    dispatch(onChangeSection("body", newHtml))
    dispatch(removeSection(sectionIndex - 1))
  }
}

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

export const onInsertBlockquote = (blockquoteHtml, beforeHtml, afterHtml) => {
  return (dispatch, getState) => {
    const {
      edit: { article, sectionIndex },
    } = getState()

    dispatch(onChangeSection("body", blockquoteHtml))
    if (afterHtml) {
      dispatch(newSection("text", sectionIndex + 1, { body: afterHtml }))
    }
    if (beforeHtml) {
      dispatch(newSection("text", sectionIndex, { body: beforeHtml }))
    }
    if ((beforeHtml || afterHtml) && !article.published) {
      debouncedSaveDispatch(dispatch)
    }
    dispatch(setSection(null))
  }
}

export const maybeRemoveEmptyText = sectionIndex => {
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

export const setupSection = (type: SectionType) => {
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
    case "text":
      return {
        type: "text",
        body: "",
      } as SectionData
  }
}
