import PropTypes from "prop-types"
import React, { Component } from "react"
import { compact } from "lodash"
import { connect } from "react-redux"
import { logError } from "client/actions/edit/errorActions"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { setSection } from "client/actions/edit/sectionActions"
import SectionContainer from "../section_container"
import SectionTool from "../section_tool"
import DragContainer from "client/components/drag_drop/index.coffee"

export class SectionList extends Component {
  static propTypes = {
    article: PropTypes.object,
    editSection: PropTypes.object,
    logErrorAction: PropTypes.func,
    onChangeArticleAction: PropTypes.func,
    sectionIndex: PropTypes.any,
    setSectionAction: PropTypes.func,
  }

  onNewSection = section => {
    const { article, setSectionAction } = this.props
    const newSectionIndex = article.sections.indexOf(section)

    setSectionAction(newSectionIndex)
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

        if (section.type !== "callout") {
          return [
            <SectionContainer
              key={`${index}-container`}
              sections={article.sections}
              section={editing ? editSection : section}
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
      <div className="SectionList edit-sections__list">
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
          <div>{this.renderSectionList()}</div>
        )}
      </div>
    )
  }
}

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
