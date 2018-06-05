import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import colors from '@artsy/reaction/dist/Assets/Colors'
import { IconDrag } from '@artsy/reaction/dist/Components/Publishing'
import { RemoveButton } from 'client/components/remove_button'
import { removeSection } from 'client/actions/edit/sectionActions'

import SectionImages from '../sections/images'
import SectionSlideshow from '../sections/slideshow'
import SectionText from '../sections/text'
import SectionVideo from '../sections/video'
import { ErrorBoundary } from 'client/components/error/error_boundary'
import { SectionEmbed } from '../sections/embed'
import { SectionSocialEmbed } from '../sections/social_embed'

export class SectionContainer extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    editing: PropTypes.bool,
    index: PropTypes.number,
    isHero: PropTypes.bool,
    onRemoveHero: PropTypes.func,
    onSetEditing: PropTypes.func,
    removeSectionAction: PropTypes.func,
    section: PropTypes.object,
    sections: PropTypes.array,
    sectionIndex: PropTypes.number
  }

  isEditing = () => {
    const { index, editing, isHero, sectionIndex } = this.props
    if (isHero) {
      return editing
    } else {
      return index === sectionIndex
    }
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
      // use boolean if article.hero_section
      setEditing = !editing
    } else {
      // use the section index if article.section
      setEditing = this.isEditing() ? null : index
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

  getSectionComponent = () => {
    const { section } = this.props

    switch (section.type) {
      case 'embed': {
        return <SectionEmbed {...this.props} />
      }
      case 'social_embed': {
        return <SectionSocialEmbed {...this.props} />
      }
      case 'image':
      case 'image_set':
      case 'image_collection': {
        return <SectionImages {...this.props} />
      }

      case 'text': {
        return (
          <SectionText {...this.props} />
        )
      }

      case 'video': {
        return <SectionVideo {...this.props} />
      }

      case 'slideshow': {
        return <SectionSlideshow {...this.props} />
      }
    }
  }

  render () {
    const {
      isHero,
      section
    } = this.props
    const { layout, type } = section

    return (
      <ErrorBoundary>
        <div className='SectionContainer'
          data-editing={this.isEditing()}
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
      </ErrorBoundary>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  sectionIndex: state.edit.sectionIndex
})

const mapDispatchToProps = {
  removeSectionAction: removeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionContainer)
