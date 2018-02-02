import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { resetSections, setSection } from 'client/actions/editActions'
import SectionContainer from '../section_container'
import SectionTool from '../section_tool'
import DragContainer from 'client/components/drag_drop/index.coffee'

export class SectionList extends Component {
  static propTypes = {
    editSection: PropTypes.object,
    resetSectionsAction: PropTypes.func,
    sectionIndex: PropTypes.any,
    setSectionAction: PropTypes.func,
    article: PropTypes.object
  }

  onNewSection = (section) => {
    const { article, setSectionAction } = this.props
    const newSectionIndex = article.sections.indexOf(section)

    setSectionAction(newSectionIndex)
  }

  onDragEnd = (newSections) => {
    const { resetSectionsAction } = this.props

    resetSectionsAction(newSections)
  }

  renderSectionList = () => {
    const {
      article,
      editSection,
      sectionIndex,
      setSectionAction
    } = this.props

    return article.sections.map((section, index) => {
      const editing = sectionIndex === index
      // if (section.type !== 'callout') {
      if (
        section.type === 'embed' ||
        section.type === 'image_collection' ||
        section.type === 'image_set' ||
        section.type === 'video'
      ) {
        return [
          <SectionContainer
            key={`${index}-container`}
            sections={article.sections}
            section={editing ? editSection : section}
            index={index}
            isDraggable
            editing={editing}
            onSetEditing={(i) => setSectionAction(i)}
          />,
          <SectionTool
            key={`${index}-tool`}
            sections={article.sections}
            index={index}
            editing={sectionIndex !== 0}
          />
        ]
      }
    })
  }

  render () {
    const {
      sectionIndex,
      article
    } = this.props

    return (
      <div className='SectionList edit-sections__list'>
        <SectionTool
          sections={article.sections}
          index={-1}
          isEditing={sectionIndex !== null}
          firstSection
          isDraggable={false}
        />
        {article.sections.length && article.sections.length > 1
          ? <DragContainer
              items={article.sections}
              onDragEnd={this.onDragEnd}
              isDraggable={sectionIndex === null}
              layout='vertical'
            >
              {this.renderSectionList()}
            </DragContainer>
          : <div>
              {this.renderSectionList()}
            </div>
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  sectionIndex: state.edit.sectionIndex,
  editSection: state.edit.section
})

const mapDispatchToProps = {
  resetSectionsAction: resetSections,
  setSectionAction: setSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionList)
