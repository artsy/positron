import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import {
  maybeMergeTextSections,
  newSection,
  onChangeSection,
  onInsertBlockquote,
  onSplitTextSection,
  removeSection,
  setSection,
} from "client/actions/edit/sectionActions"
import {
  Button,
  TextNavContainer,
} from "client/components/draft/components/text_nav"
import { RichText } from "client/components/draft/rich_text/rich_text"
import { convertDraftToHtml } from "client/components/draft/rich_text/utils/convert"
import { blockMapFromNodes } from "client/components/draft/rich_text/utils/utils"
import {
  richTextBlockElements,
  richTextStyleElements,
} from "client/components/draft/rich_text/utils/utils"
import { getSelectionDetails } from "client/components/draft/shared/selection"
import { styleMapFromNodes } from "client/components/draft/shared/shared"
import { BlockElement } from "client/components/draft/typings"
import { ContentState, EditorState } from "draft-js"
import { cloneDeep } from "lodash"
import React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import _s from "underscore.string"

interface Props {
  article: any
  editing: boolean
  index: number
  isInternalChannel: boolean
  newSectionAction: (type: string, index: number, val: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  onInsertBlockquoteAction: (
    blockquote: string,
    beforeHtml: string,
    afterHtml: string
  ) => void
  maybeMergeTextSectionsAction: () => void
  onSplitTextSectionAction: (originalBody: string, newBody: string) => void
  section: any
  sectionIndex: number | null
  setSectionAction: (sectionIndex: number | null) => void
}

export class SectionText2 extends React.Component<Props> {
  getAllowedBlocks = () => {
    const {
      isInternalChannel,
      article: { layout },
    } = this.props
    const blocks: BlockElement[] = richTextBlockElements

    switch (layout) {
      case "feature": {
        return [
          "h1",
          "h2",
          "h3",
          "blockquote",
          "ol",
          "ul",
          "p",
        ] as BlockElement[]
      }
      case "standard": {
        return ["h2", "h3", "blockquote", "ol", "ul", "p"] as BlockElement[]
      }
      case "news": {
        return ["h3", "blockquote", "ol", "ul", "p"] as BlockElement[]
      }
      case "classic": {
        if (isInternalChannel) {
          return ["h2", "h3", "blockquote", "ol", "ul", "p"] as BlockElement[]
        }
      }
    }

    return blocks
  }

  onHandleReturn = (
    editorState: EditorState,
    _resetEditorState: () => void
  ) => {
    const { isInternalChannel, onSplitTextSectionAction } = this.props
    const allowedBlocks = this.getAllowedBlocks()
    const allowedStyles = richTextStyleElements
    const { anchorKey } = getSelectionDetails(editorState)

    const newBlocks = divideEditorState(
      editorState,
      anchorKey,
      blockMapFromNodes(allowedBlocks),
      styleMapFromNodes(allowedStyles),
      isInternalChannel
    )
    if (newBlocks) {
      onSplitTextSectionAction(newBlocks.beforeHtml, newBlocks.afterHtml)
    }
  }

  /**
   * Change to next section when tabbing, reset editor state
   */
  onHandleTab = (e: any, resetEditorState: () => void) => {
    const { index, setSectionAction } = this.props

    if (e.shiftKey) {
      setSectionAction(index - 1)
    } else {
      setSectionAction(index + 1)
    }
    resetEditorState()
  }

  /**
   * Extract blockquote to its own section to accomodate wide layout
   */
  onHandleBlockQuote = (html: string) => {
    const { onInsertBlockquoteAction } = this.props
    const newBlocks = extractBlockQuote(html)

    if (newBlocks) {
      const { blockquote, beforeHtml, afterHtml } = newBlocks
      onInsertBlockquoteAction(blockquote, beforeHtml, afterHtml)
    }
  }

  /**
   * Maybe merge two text sections into one
   */
  onHandleBackspace = () => {
    const { index, maybeMergeTextSectionsAction } = this.props

    if (index !== 0) {
      maybeMergeTextSectionsAction()
    }
  }

  render() {
    const {
      article: { layout },
      editing,
      isInternalChannel,
      onChangeSectionAction,
      section,
      sectionIndex,
    } = this.props
    const isDark = ["series", "video"].includes(layout)
    const allowedBlocks = this.getAllowedBlocks()

    return (
      <SectionTextContainer isEditing={editing} layout={layout}>
        <Text layout={layout}>
          <RichText
            allowedBlocks={allowedBlocks}
            allowedStyles={richTextStyleElements}
            editIndex={sectionIndex}
            isReadonly={!editing}
            hasFollowButton={isInternalChannel}
            hasLinks
            html={section.body || ""}
            isDark={isDark}
            onHandleBackspace={this.onHandleBackspace}
            onHandleBlockQuote={this.onHandleBlockQuote}
            onHandleReturn={this.onHandleReturn}
            onHandleTab={this.onHandleTab}
            onChange={html => onChangeSectionAction("body", html)}
          />
        </Text>
      </SectionTextContainer>
    )
  }
}

// TODO: move to redux text section actions
export const extractBlockQuote = (html: string) => {
  let blockquote = html
  const beforeHtml = _s(html).strLeft("<blockquote>")._wrapped
  const afterHtml = _s(html).strRight("</blockquote>")._wrapped

  if (beforeHtml) {
    // add text before blockquote to new text section
    blockquote = blockquote.replace(beforeHtml, "")
  }
  if (afterHtml) {
    // add text after blockquote to new text section
    blockquote = blockquote.replace(afterHtml, "")
  }
  const newBlocks = {
    blockquote,
    beforeHtml,
    afterHtml,
  }
  return newBlocks
}

// TODO: move to redux text section actions
export const divideEditorState = (
  editorState,
  anchorKey,
  allowedBlocks,
  allowedStyles,
  hasFollowButton
) => {
  const blockArray = editorState.getCurrentContent().getBlocksAsArray()
  let beforeBlocks
  let afterBlocks

  blockArray.map((block, index) => {
    if (block.getKey() === anchorKey) {
      // split blocks from end of selected block
      beforeBlocks = blockArray.splice(0, index)
      afterBlocks = cloneDeep(blockArray)
    }
  })

  if (beforeBlocks) {
    const beforeContent = ContentState.createFromBlockArray(beforeBlocks)
    const afterContent = ContentState.createFromBlockArray(afterBlocks)

    const beforeHtml = convertDraftToHtml(
      beforeContent,
      allowedBlocks,
      allowedStyles,
      hasFollowButton
    )
    const afterHtml = convertDraftToHtml(
      afterContent,
      allowedBlocks,
      allowedStyles,
      hasFollowButton
    )

    return {
      beforeHtml,
      afterHtml,
    }
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  isInternalChannel: state.app.channel.type !== "partner",
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  maybeMergeTextSectionsAction: maybeMergeTextSections,
  newSectionAction: newSection,
  onChangeSectionAction: onChangeSection,
  onInsertBlockquoteAction: onInsertBlockquote,
  onSplitTextSectionAction: onSplitTextSection,
  removeSectionAction: removeSection,
  setSectionAction: setSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionText2)

const SectionTextContainer = styled.div<{
  isEditing?: boolean
  layout: string
}>`
  position: relative;
  z-index: ${props => (props.isEditing ? 10 : -1)};

  ol li,
  ul li,
  li {
    list-style: none;
    .public-DraftStyleDefault-ltr {
      display: list-item;
      margin-left: 20px;
      padding-left: 10px;
    }
  }
  ol li .public-DraftStyleDefault-ltr,
  li.public-DraftStyleDefault-orderedListItem .public-DraftStyleDefault-ltr {
    list-style: decimal;
  }
  ul li .public-DraftStyleDefault-ltr,
  li.public-DraftStyleDefault-unorderedListItem .public-DraftStyleDefault-ltr {
    list-style: disc;
  }
  ${TextNavContainer} {
    ${({ layout }) =>
      layout === "standard" &&
      `
      max-width: 250px;
    `} ${Button} {
      ${({ layout }) =>
        layout === "standard" &&
        `
        &:nth-child(7) {
          display: none;
        }
      `};
    }
  }
`
