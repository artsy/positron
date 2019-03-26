import {
  ArticleData,
  SectionData,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { logError } from "client/actions/edit/errorActions"
import { setSection } from "client/actions/edit/sectionActions"
import { compact } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import { data as sd } from "sharify"
import styled from "styled-components"
import SectionContainer from "../section_container"
import SectionTool from "../section_tool"
const DragContainer = require("client/components/drag_drop/index.coffee")

interface SectionListProps {
  article: ArticleData
  editSection: SectionData
  logErrorAction: (error: { message: string }) => void
  onChangeArticleAction: (key: any, value?: any) => void
  sectionIndex: number
  setSectionAction: (section: number | null) => void
}

export class SectionList extends Component<SectionListProps> {
  onNewSection = (section: SectionData) => {
    const { article, setSectionAction } = this.props
    const newSectionIndex =
      article.sections && article.sections.indexOf(section)
    // TODO: double check if necessary in new text
    newSectionIndex && setSectionAction(newSectionIndex)
  }

  onDragEnd = newSections => {
    const {
      article: { layout },
      logErrorAction,
      onChangeArticleAction,
    } = this.props

    if (newSections[0].type === "social_embed" && layout === "news") {
      return logErrorAction({
        message: "Embeds are not allowed in the first section.",
      })
    }
    onChangeArticleAction("sections", compact(newSections))
  }

  renderSectionList = () => {
    const { article, editSection, sectionIndex, setSectionAction } = this.props
    if (article.sections) {
      return article.sections.map((section, index) => {
        const editing = sectionIndex === index
        // TODO: remove after merging text2
        let editableSection = editing ? editSection : section
        if (sd.IS_EDIT_2 && editing && section.type === "text") {
          editableSection = section
        }
        // TODO: deprecate callout sections
        // @ts-ignore
        if (section.type !== "callout") {
          return [
            <SectionContainer
              key={`${index}-container`}
              sections={article.sections}
              section={editableSection}
              index={index}
              isDraggable
              editing={editing}
              onSetEditing={i => setSectionAction(i)}
            />,
            <SectionTool
              key={`${index}-tool`}
              sections={article.sections}
              index={index}
              editing={sectionIndex !== 0}
              isDraggable={false}
            />,
          ]
        }
      })
    }
  }

  render() {
    const { sectionIndex, article } = this.props

    return (
      <SectionListContainer layout={article.layout}>
        <ListItemsContainer layout={article.layout}>
          <SectionTool
            sections={article.sections || []}
            index={-1}
            isEditing={sectionIndex !== null}
            firstSection
            isDraggable={false}
          />

          {article.sections && article.sections.length > 1 ? (
            <DragContainer
              items={article.sections}
              onDragEnd={this.onDragEnd}
              isDraggable={sectionIndex === null}
              layout="vertical"
            >
              {this.renderSectionList()}
            </DragContainer>
          ) : (
            <>{this.renderSectionList()}</>
          )}
        </ListItemsContainer>
      </SectionListContainer>
    )
  }
}

const SectionListContainer = styled.div<{ layout: string }>`
  width: 100%;
  position: relative;

  ${props =>
    props.layout === "standard" &&
    `
    max-width: 1250px;
    margin: 0 auto;

    @media (max-width: 1380px) {
      padding: 0 20px;
    }
  `};
`

const ListItemsContainer = styled.div<{ layout: string }>`
  ${props =>
    props.layout === "standard" &&
    `
    max-width: 820px;
  `};
`

const mapStateToProps = state => ({
  article: state.edit.article,
  sectionIndex: state.edit.sectionIndex,
  editSection: state.edit.section,
})

const mapDispatchToProps = {
  logErrorAction: logError,
  onChangeArticleAction: onChangeArticle,
  setSectionAction: setSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionList)
