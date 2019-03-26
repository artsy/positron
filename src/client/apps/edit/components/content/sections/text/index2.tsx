import { Text } from "@artsy/reaction/dist/Components/Publishing/Sections/Text"
import {
  ArticleData,
  SectionData,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import {
  onChangeSection,
  removeSection,
  setSection,
} from "client/actions/edit/sectionActions"
import {
  maybeMergeTextSections,
  onHandleBlockQuote,
  onSplitTextSection,
} from "client/actions/edit/textSectionActions"
import {
  Button,
  TextNavContainer,
} from "client/components/draft/components/text_nav"
import { RichText } from "client/components/draft/rich_text/rich_text"
import { convertDraftToHtml } from "client/components/draft/rich_text/utils/convert"
import {
  blockMapFromNodes,
  richTextBlockElements,
  richTextStyleElements,
  richTextStyleMap,
} from "client/components/draft/rich_text/utils/utils"
import { getSelectionDetails } from "client/components/draft/shared/selection"
import { BlockElement } from "client/components/draft/typings"
import { ContentState, EditorState } from "draft-js"
import { cloneDeep } from "lodash"
import React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import _s from "underscore.string"

interface Props {
  article: ArticleData
  editing: boolean
  index: number
  isInternalChannel: boolean
  onChangeSectionAction: (key: string, val: any) => void
  onHandleBlockQuoteAction: (html: string) => void
  maybeMergeTextSectionsAction: () => void
  onSplitTextSectionAction: (originalBody: string, newBody: string) => void
  section: SectionData
  sectionIndex: number | null
  setSectionAction: (sectionIndex: number | null) => void
}

export class SectionText2 extends React.Component<Props> {
  /**
   * Returns array of allowed html block elements for article.layout
   */
  getAllowedBlocks = () => {
    const {
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
      default: {
        return blocks
      }
    }
  }

  /**
   * If section should be divided on return, divide it
   */
  onHandleReturn = (editorState: EditorState) => {
    const { onSplitTextSectionAction } = this.props
    const newBlocks = this.divideEditorState(editorState)

    if (newBlocks) {
      onSplitTextSectionAction(newBlocks.beforeHtml, newBlocks.afterHtml)
    }
  }

  /**
   * Change to next section when tabbing, reset editor state
   */
  onHandleTab = (e: any) => {
    const { index, setSectionAction } = this.props

    if (e.shiftKey) {
      setSectionAction(index - 1)
    } else {
      setSectionAction(index + 1)
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

  /**
   * Divide an editorState into two editStates at anchorKey
   */
  divideEditorState = (editorState: EditorState) => {
    const { isInternalChannel } = this.props
    const blockArray = editorState.getCurrentContent().getBlocksAsArray()
    const { anchorKey } = getSelectionDetails(editorState)
    const allowedBlocks = blockMapFromNodes(this.getAllowedBlocks())
    const allowedStyles = richTextStyleMap
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
        isInternalChannel
      )
      const afterHtml = convertDraftToHtml(
        afterContent,
        allowedBlocks,
        allowedStyles,
        isInternalChannel
      )

      return {
        beforeHtml,
        afterHtml,
      }
    }
  }

  render() {
    const {
      article: { layout },
      editing,
      isInternalChannel,
      onChangeSectionAction,
      onHandleBlockQuoteAction,
      section,
      sectionIndex,
    } = this.props
    const isDark = layout && ["series", "video"].includes(layout)
    const allowedBlocks = this.getAllowedBlocks()

    return (
      <SectionTextContainer isEditing={editing} layout={layout}>
        <Text layout={layout || "standard"}>
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
            onHandleBlockQuote={onHandleBlockQuoteAction}
            onHandleReturn={this.onHandleReturn}
            onHandleTab={this.onHandleTab}
            onChange={html => onChangeSectionAction("body", html)}
          />
        </Text>
      </SectionTextContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  isInternalChannel: !state.app.isPartnerChannel,
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  maybeMergeTextSectionsAction: maybeMergeTextSections,
  onChangeSectionAction: onChangeSection,
  onHandleBlockQuoteAction: onHandleBlockQuote,
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
    `};

    ${Button} {
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
