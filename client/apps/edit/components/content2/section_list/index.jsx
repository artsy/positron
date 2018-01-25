import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setSection } from 'client/actions/editActions'
import SectionContainer from '../section_container'
import SectionTool from '../section_tool'
import DragContainer from 'client/components/drag_drop/index.coffee'

export class SectionList extends Component {
  static propTypes = {
    sectionIndex: PropTypes.any,
    setSectionAction: PropTypes.func,
    article: PropTypes.object
  }

  componentDidMount = () => {
    console.log('mounted')
    // const { sections } = this.props

    // sections.on('add', this.onNewSection)
    // // TODO: Remove forceRerender
    // sections.on('change:layout', this.forceReRender)
    // sections.on('reset', this.forceReRender)
    // sections.on('destroy', this.forceReRender)
  }

  onNewSection = (section) => {
    const { article, setSectionAction } = this.props
    const newSectionIndex = article.sections.indexOf(section)

    setSectionAction(newSectionIndex)
  }

  onDragEnd = (newSections) => {
    const { sections } = this.props.article
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
      article,
      sectionIndex,
      setSectionAction
    } = this.props

    return article.sections.map((section, index) => {
      // if (section.type !== 'callout') {
      if (section.type === 'image_collection') {
        return [
          <SectionContainer
            key={section.cid}
            sections={article.sections}
            section={section}
            index={index}
            isDraggable
            editing={sectionIndex === index}
            onSetEditing={(i) => setSectionAction(i)}
          />,
          <SectionTool
            key={section.cid + 'tool'}
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
  sectionIndex: state.edit.sectionIndex
})

const mapDispatchToProps = {
  setSectionAction: setSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionList)
