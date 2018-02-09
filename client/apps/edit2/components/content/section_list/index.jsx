import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setSection } from 'client/actions/editActions'
import SectionContainer from '../section_container'
import { SectionTool } from '../section_tool'
import DragContainer from 'client/components/drag_drop/index.coffee'

export class SectionList extends Component {
  static propTypes = {
    sectionIndex: PropTypes.any,
    setSectionAction: PropTypes.func,
    sections: PropTypes.object.isRequired
  }

  componentDidMount = () => {
    const { sections } = this.props

    sections.on('add', this.onNewSection)
    // TODO: Remove forceRerender
    sections.on('change:layout', this.forceReRender)
    sections.on('reset', this.forceReRender)
    sections.on('destroy', this.forceReRender)
  }

  onNewSection = (section) => {
    const { setSectionAction, sections } = this.props
    const newSectionIndex = sections.indexOf(section)

    setSectionAction(newSectionIndex)
  }

  onDragEnd = (newSections) => {
    const { sections } = this.props
    sections.reset(newSections)
  }

  forceReRender = () => {
    // TODO: Move sections to redux so
    // changes will trigger re-render
    // Below forces update on Backbone change
    this.setState({lastUpdated: new Date()})
  }

  renderSectionList = () => {
    const {
      sectionIndex,
      setSectionAction,
      sections
    } = this.props

    return sections.map((section, index) => {
      if (section.get('type') !== 'callout') {
        return (
          <div key={section.cid}>
            <SectionContainer
              sections={sections}
              section={section}
              index={index}
              isDraggable
              editing={sectionIndex === index}
              onSetEditing={(i) => setSectionAction(i)}
            />
            <SectionTool
              sections={sections}
              index={index}
              editing={sectionIndex !== 0}
            />
          </div>
        )
      }
    })
  }

  render () {
    const {
      sectionIndex,
      sections
    } = this.props

    return (
      <div className='SectionList edit-sections__list'>
        <SectionTool
          sections={sections}
          index={-1}
          isEditing={sectionIndex !== null}
          firstSection
          isDraggable={false}
        />
        {sections.length && sections.length > 1
          ? <DragContainer
              items={sections.models}
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
  sectionIndex: state.edit.sectionIndex
})

const mapDispatchToProps = {
  setSectionAction: setSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionList)
