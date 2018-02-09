import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { findIndex, findLastIndex } from 'lodash'
import colors from '@artsy/reaction-force/dist/Assets/Colors'
import { IconDrag } from '@artsy/reaction-force/dist/Components/Publishing'
import { RemoveButton } from 'client/components/remove_button'
import { removeSection } from 'client/actions/editActions'

import SectionImages from '../sections/images'
import SectionSlideshow from '../sections/slideshow'
import SectionText from '../sections/text'
import SectionVideo from '../sections/video'
import { SectionEmbed } from '../sections/embed'

export class SectionContainer extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    index: PropTypes.number,
    isHero: PropTypes.bool,
    onRemoveHero: PropTypes.func,
    onSetEditing: PropTypes.func,
    removeSectionAction: PropTypes.func,
    section: PropTypes.object,
    sections: PropTypes.array
  }

  onSetEditing = () => {
    const {
      editing,
      index,
      isHero,
      onSetEditing
    } = this.props

    let setEditing

    if (isHero) {
      setEditing = !editing
    } else {
      setEditing = editing ? null : index
    }
    onSetEditing(setEditing)
  }

  onRemoveSection = () => {
    const {
      index,
      isHero,
      onRemoveHero,
      removeSectionAction
    } = this.props

    if (isHero) {
      onRemoveHero()
    } else {
      removeSectionAction(index)
    }
  }

  getContentStartEnd = () => {
    // TODO: move into text section
    const { sections } = this.props
    const types = sections && sections.map((section, i) => {
      return { type: section.type, index: i }
    })
    const start = findIndex(types, {type: 'text'})
    const end = findLastIndex(types, {type: 'text'})

    return { start, end }
  }

  getSectionComponent = () => {
    const { channel, index, section } = this.props

    switch (section.type) {
      case 'embed': {
        return <SectionEmbed {...this.props} />
      }

      case 'image':
      case 'image_set':
      case 'image_collection': {
        return <SectionImages {...this.props} />
      }

      case 'text': {
        const { end, start } = this.getContentStartEnd()
        return (
          <SectionText
            {...this.props}
            hasFeatures={channel.type !== 'partner'}
            isContentStart={start === index}
            isContentEnd={end === index}
          />
        )
      }

      case 'video': {
        return (
          <SectionVideo {...this.props} />
        )
      }

      case 'slideshow': {
        return (
          <SectionSlideshow {...this.props} />
        )
      }
    }
  }

  render () {
    const {
      editing,
      isHero,
      section
    } = this.props
    const { layout, type } = section

    return (
      <div className='SectionContainer'
        data-editing={editing}
        data-layout={layout || 'column_width'}
        data-type={type}
      >
        <div
          className='SectionContainer__hover-controls'
          onClick={this.onSetEditing}
        >
          {!isHero &&
            <div className='button-drag'>
              <IconDrag background={colors.grayMedium} />
            </div>
          }
          <RemoveButton
            onClick={this.onRemoveSection}
            background={colors.grayMedium}
          />
        </div>

        {this.getSectionComponent()}

        <div
          className='SectionContainer__container-bg'
          onClick={this.onSetEditing}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  channel: state.app.channel
})

const mapDispatchToProps = {
  removeSectionAction: removeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionContainer)
