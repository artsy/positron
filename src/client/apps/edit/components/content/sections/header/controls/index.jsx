import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import ModalCover from './ModalCover'
import { VideoControls } from './VideoControls'
import { LayoutControls } from './LayoutControls'
import { onChangeHero } from 'client/actions/edit/sectionActions'

export class HeaderControls extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChangeHeroAction: PropTypes.func.isRequired,
    onProgress: PropTypes.func.isRequired
  }

  state = {
    isLayoutOpen: false,
    isVideoOpen: false
  }

  toggleControls = (controlType) => {
    const { isLayoutOpen, isVideoOpen } = this.state

    switch (controlType) {
      case 'layout': {
        return this.setState({
          isLayoutOpen: !isLayoutOpen,
          isVideoOpen: false
        })
      }
      case 'video': {
        return this.setState({
          isVideoOpen: !isVideoOpen,
          isLayoutOpen: false
        })
      }
      case 'close': {
        return this.setState({
          isVideoOpen: false,
          isLayoutOpen: false
        })
      }
    }
  }

  render() {
    const { isLayoutOpen, isVideoOpen } = this.state
    const { article, onChangeHeroAction, onProgress } = this.props

    const hero = article.hero_section || {}
    const isModalOpen = isLayoutOpen || isVideoOpen
    const isBasicHero = hero.type === 'basic'

    return (
      <div className='edit-header__container'>
        {isModalOpen &&
          <ModalCover
            onClick={() => this.toggleControls('close')}
          />
        }
        {isBasicHero &&
          <VideoControls
            article={article}
            isOpen={isVideoOpen}
            onChange={onChangeHeroAction}
            onProgress={onProgress}
            onClick={() => this.toggleControls('video')}
          />
        }
        <LayoutControls
          hero={hero}
          isOpen={isLayoutOpen}
          onChange={onChangeHeroAction}
          onClick={() => this.toggleControls('layout')}
        />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article
})

const mapDispatchToProps = {
  onChangeHeroAction: onChangeHero
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderControls)
