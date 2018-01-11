import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from 'client/actions/editActions'
import DragContainer from 'client/components/drag_drop/index.coffee'
import { SectionContainer } from '../section_container/index'
import { SectionTool } from '../section_tool/index'

export class SectionList extends Component {
  static propTypes = {
    actions: PropTypes.object,
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    edit: PropTypes.object,
    sections: PropTypes.object.isRequired
  }

  componentDidMount = () => {
    const { sections } = this.props

    sections.on('add', this.onNewSection)
  }

  onNewSection = (section) => {
    const { actions, sections } = this.props
    const activeSection = sections.indexOf(section)

    actions.changeSection(activeSection)
  }

  onDragEnd = (newSections) => {
    const { sections } = this.props

    sections.reset(newSections)
    // force update until sections live in state
    this.setState({lastUpdated: new Date()})
  }

  renderSectionList = () => {
    const {
      actions,
      article,
      channel,
      edit,
      sections
    } = this.props

    const { activeSection } = edit

    return sections.map((section, index) => {
      if (section.get('type') !== 'callout') {
        return (
          <div key={section.cid}>
            <SectionContainer
              sections={sections}
              section={section}
              index={index}
              isDraggable
              editing={activeSection === index}
              channel={channel}
              onSetEditing={(i) => actions.changeSection(i)}
              article={article}
            />
            <SectionTool
              sections={sections}
              index={index}
              editing={activeSection !== 0}
            />
          </div>
        )
      }
    })
  }

  render () {
    const { article, edit, sections } = this.props
    const { activeSection } = edit

    return (
      <div className='SectionList edit-sections__list'>
        {sections.length && sections.length > 1
          ? <DragContainer
              items={sections.models}
              onDragEnd={this.onDragEnd}
              isDraggable={!activeSection}
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
          isEditing={activeSection !== null}
          firstSection
          isDraggable={false}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionList)
