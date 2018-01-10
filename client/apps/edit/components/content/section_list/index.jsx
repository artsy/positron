import PropTypes from 'prop-types'
import React, { Component } from 'react'
import DragContainer from 'client/components/drag_drop/index.coffee'
import SectionContainer from '../section_container/index.coffee'
import { SectionTool } from '../section_tool/index.jsx'

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
    sections.on('remove', this.onRemoveSection)
  }

  onSetEditing = (editingIndex) => {
    this.setState({ editingIndex })
  }

  onNewSection = (section) => {
    const { sections } = this.props

    const editingIndex = sections.indexOf(section)
    this.setState({ editingIndex })
  }

  onRemoveSection = () => {
    const { article, sections } = this.props

    if (sections.isEmpty()) {
      article.set('sections', [])
    }
    this.forceUpdate()
  }

  onDragEnd = (newSections) => {
    const { article, sections } = this.props
    debugger
    sections.reset(newSections)
    // if (article.get('published')) {
    // this.setState({ changedSections: new Date() })
    // }
  }

  isDraggable = () => {
    const { editingIndex } = this.state

    return editingIndex || editingIndex === 0
  }

  render () {
    const {
      article,
      channel,
      sections
    } = this.props

    const { editingIndex } = this.state

    return (
      <div className='SectionList edit-sections__list'>
        <SectionTool
          sections={sections}
          index={-1}
          key={1}
          isEditing={editingIndex !== null}
          firstSection
          isDraggable={false}
        />
        {sections.length &&
          <DragContainer
            items={sections.models}
            onDragEnd={this.onDragEnd}
            isDraggable
            layout='vertical'
            article={article}
          >
            {sections.map((section, index) =>
              section.get('type') !== 'callout' &&
                <div key={section.cid}>
                  <SectionContainer
                    sections={sections}
                    section={section}
                    index={index}
                    isDraggable
                    editing={editingIndex === index}
                    channel={channel}
                    onSetEditing={this.onSetEditing}
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
          </DragContainer>
        }
      </div>
    )
  }
}
