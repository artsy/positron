import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { IconImageFullscreen } from '@artsy/reaction-force/dist/Components/Publishing'
import { onChangeSection } from 'client/actions/editActions'

export class LayoutControls extends Component {
  static propTypes = {
    article: PropTypes.object,
    channel: PropTypes.object,
    disabledAlert: PropTypes.func,
    section: PropTypes.object,
    onChange: PropTypes.func
  }

  changeLayout = (layout) => {
    const { section, disabledAlert, onChange } = this.props
    const { images, type } = section

    const isFillwidth = layout === 'fillwidth'
    const isImage = this.sectionIsImage()

    if (isFillwidth && isImage && images.length > 1) {
      return disabledAlert()
    }
    if (type === 'image_set') {
      onChange('type', 'image_collection')
    }
    onChange('layout', layout)
  }

  toggleImageSet = () => {
    const { section, onChange } = this.props

    if (section.type === 'image_collection') {
      onChange('type', 'image_set')
      onChange('layout', 'mini')
    }
  }

  hasImageSet = () => {
    const { type } = this.props.channel

    const isImage = this.sectionIsImage()
    const isEditoral = type === 'editorial'
    const isTeam = type === 'team'

    return isImage && isEditoral || isTeam
  }

  sectionIsImage = () => {
    const { type } = this.props.section

    return type.includes('image')
  }

  sectionHasFullscreen = () => {
    const { article, section } = this.props

    const isFeature = article.layout === 'feature'
    const isImage = this.sectionIsImage()
    const isMedia = ['embed', 'video'].includes(section.type)
    const hasFullscreen = isMedia || isImage

    return isFeature && hasFullscreen
  }

  render () {
    const { section } = this.props
    const hasImageSet = this.hasImageSet()
    const hasFullscreen = this.sectionHasFullscreen()

    return (
      <nav className='edit-controls__layout'>
        <a
          name='overflow_fillwidth'
          className='layout'
          onClick={() => this.changeLayout('overflow_fillwidth')}
          data-active={section.layout === 'overflow_fillwidth'}
        />
        <a
          name='column_width'
          className='layout'
          onClick={() => this.changeLayout('column_width')}
          data-active={section.layout === 'column_width'}
        />

        {hasFullscreen &&
          <a
            name='fillwidth'
            className='layout'
            onClick={() => this.changeLayout('fillwidth')}
            data-active={section.layout === 'fillwidth'}
          >
            <IconImageFullscreen fill={'white'} />
          </a>
        }

        {hasImageSet &&
          <a
            name='image_set'
            className='layout'
            onClick={this.toggleImageSet}
            data-active={section.type === 'image_set'}
          />
        }
      </nav>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  channel: state.app.channel,
  section: state.edit.section
})

const mapDispatchToProps = {
  onChange: onChangeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LayoutControls)
