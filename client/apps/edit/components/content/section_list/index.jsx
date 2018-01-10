import PropTypes from 'prop-types'
import React, { Component } from 'react'
import DragContainer from 'client/components/drag_drop/index.coffee'
import { SectionContainer } from '../section_container/index'
import { SectionTool } from '../section_tool/index'

export class SectionList extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    sections: PropTypes.object.isRequired
  }

  state = {
    editingIndex: null
  }

  componentDidMount = () => {
    const { sections } = this.props

    sections.on('add', this.onNewSection)
  }

  onNewSection = (section) => {
    const { sections } = this.props

    const editingIndex = sections.indexOf(section)
    this.setState({ editingIndex })
  }

  renderSectionList = () => {
    const {
      article,
      channel,
      sections
    } = this.props

    const { editingIndex } = this.state

    return sections.map((section, index) => {
      if (section.get('type') !== 'callout') {
        return (
          <div key={section.cid}>
            <SectionContainer
              sections={sections}
              section={section}
              index={index}
              isDraggable
              editing={editingIndex === index}
              channel={channel}
              onSetEditing={(editingIndex) => this.setState({ editingIndex })}
              article={article}
            />
            <SectionTool
              sections={sections}
              index={index}
              editing={editingIndex !== 0}
            />
          </div>
        )
      }
    })
  }

  render () {
    const { article, sections } = this.props
    const { editingIndex } = this.state

    return (
      <div className='SectionList edit-sections__list'>
        {sections.length && sections.length > 1
          ? <DragContainer
              items={sections.models}
              onDragEnd={(newSections) => sections.reset(newSections)}
              isDraggable
              layout='vertical'
              article={article}
            >
              {this.renderSectionList()}
            </DragContainer>
          : <div>
              {this.renderSectionList()}
            </div>
        }
        <SectionTool
          sections={sections}
          index={-1}
          key={1}
          isEditing={editingIndex !== null}
          firstSection
          isDraggable={false}
        />
      </div>
    )
  }
}
