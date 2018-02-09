import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { clone, extend, findIndex, findLastIndex } from 'lodash'
import colors from '@artsy/reaction-force/dist/Assets/Colors'
import { IconDrag } from '@artsy/reaction-force/dist/Components/Publishing'
import { RemoveButton } from 'client/components/remove_button'

import SectionSlideshow from '../sections/slideshow'
import { SectionText } from '../sections/text/index.jsx'
import { ErrorBoundary } from 'client/components/error/error_boundary'
import { SectionEmbed } from '../sections/embed'
import { SectionImages } from '../sections/images'
import { SectionVideo } from '../sections/video'

export class SectionContainer extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    channel: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    index: PropTypes.number.isRequired,
    isHero: PropTypes.bool,
    onRemoveHero: PropTypes.func,
    onSetEditing: PropTypes.func.isRequired,
    section: PropTypes.object.isRequired,
    sections: PropTypes.object
  }

  onSetEditing = () => {
    const {
      editing,
      index,
      onSetEditing
    } = this.props

    const setEditing = editing ? null : index
    onSetEditing(setEditing)
  }

  onRemoveSection = (e) => {
    const {
      section,
      isHero,
      onRemoveHero
    } = this.props

    e.stopPropagation()
    section.destroy()

    if (isHero) {
      onRemoveHero()
    }
  }

  onChangeSection = (key, value) => {
    const { section } = this.props
    // TODO: Use redux action
    section.set(key, value)
  }

  getContentStartEnd = () => {
    // TODO: move into text section
    const { sections } = this.props
    const types = sections && sections.map((section, i) => {
      return { type: section.get('type'), index: i }
    })
    const start = findIndex(types, {type: 'text'})
    const end = findLastIndex(types, {type: 'text'})

    return { start, end }
  }

  getSectionComponent = () => {
    const { channel, index, section } = this.props

    switch (section.get('type')) {
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
        const textProps = extend(clone(this.props), {
          section: section.attributes,
          hasFeatures: channel.type !== 'partner',
          isContentStart: start === index,
          isContentEnd: end === index,
          onChange: this.onChangeSection
        })
        return (
          <SectionText {...textProps} />
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

    return (
      <ErrorBoundary>
        <div className='SectionContainer'
          data-editing={editing}
          data-layout={section.get('layout') || 'column_width'}
          data-type={section.get('type')}
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
      </ErrorBoundary>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  channel: state.app.channel
})

export default connect(
  mapStateToProps
)(SectionContainer)
