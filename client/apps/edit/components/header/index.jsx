import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from 'client/actions/editActions'
import Icon from '@artsy/reaction-force/dist/Components/Icon'
import colors from '@artsy/reaction-force/dist/Assets/Colors'

export class EditHeader extends Component {
  static propTypes = {
    actions: PropTypes.any,
    article: PropTypes.object,
    beforeUnload: PropTypes.func,
    channel: PropTypes.object,
    edit: PropTypes.object,
    isAdmin: PropTypes.bool
  }

  isPublishable = () => {
    const { article } = this.props
    return article.finishedContent() && article.finishedThumbnail()
  }

  onPublish = () => {
    const { actions, article } = this.props

    if (this.isPublishable()) {
      actions.publishArticle(
        article,
        !article.get('published')
      )
    }
  }

  onSave = () => {
    const { actions, article } = this.props

    this.removeUnsavedAlert()
    actions.saveArticle(article)
  }

  onDelete = () => {
    const { actions, article } = this.props

    if (confirm('Are you sure?')) {
      this.removeUnsavedAlert()
      actions.deleteArticle(article)
    }
  }

  removeUnsavedAlert = () => {
    const { beforeUnload } = this.props
    // dont show popup for unsaved changes when saving/deleting
    window.removeEventListener('beforeunload', beforeUnload)
  }

  getSaveColor = () => {
    const { isSaving, isSaved } = this.props.edit

    if (isSaving) {
      return colors.greenRegular
    } else if (isSaved) {
      return 'black'
    } else {
      return colors.redMedium
    }
  }

  getSaveText = () => {
    const { article, edit } = this.props
    const { isSaving } = edit

    if (isSaving) {
      return 'Saving...'
    } else if (article.get('published')) {
      return 'Save Article'
    } else {
      return 'Save Draft'
    }
  }

  getPublishText = () => {
    const { article, edit } = this.props
    const { isPublishing } = edit
    const isPublished = article.get('published')

    if (isPublishing && isPublished) {
      return 'Publishing...'
    } else if (isPublishing) {
      return 'Unpublishing...'
    } else if (isPublished) {
      return 'Unpublish'
    } else {
      return 'Publish'
    }
  }

  render () {
    const { article, actions, channel, edit, isAdmin } = this.props
    const { changeView } = actions
    const { activeView, isDeleting } = edit
    const { grayMedium, greenRegular } = colors

    return (
      <div className='EditHeader'>

        <div className='EditHeader__left'>
          <div className='EditHeader__tabs'>
            <button
              className='avant-garde-button check'
              onClick={() => changeView('content')}
              data-active={activeView === 'content'}
            >
              <span>Content</span>
              <Icon
                className='icon'
                name='check'
                color={article.finishedContent() ? greenRegular : grayMedium}
              />
            </button>

            <button
              className='avant-garde-button check'
              onClick={() => changeView('display')}
              data-active={activeView === 'display'}
            >
              <span>Display</span>
              <Icon
                className='icon'
                name='check'
                color={article.finishedThumbnail() ? greenRegular : grayMedium}
              />
            </button>

            {isAdmin &&
              <button
                className='avant-garde-button'
                onClick={() => changeView('admin')}
                data-active={activeView === 'admin'}
              >
                Admin
              </button>
            }
          </div>

          <div>
            <button
              className='avant-garde-button publish'
              data-disabled={!this.isPublishable()}
              onClick={this.onPublish}
            >
              {this.getPublishText()}
            </button>

            {channel.type === 'editorial' &&
              <button
                className='avant-garde-button autolink'
              >
                Auto-link
              </button>
            }
          </div>
        </div>

        <div className='EditHeader__right'>
          <button
            className='avant-garde-button delete'
            onClick={this.onDelete}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>

          <button
            className='avant-garde-button'
            style={{color: this.getSaveColor()}}
            onClick={this.onSave}
          >
            {this.getSaveText()}
          </button>

          <a href={article.getFullSlug()} target='_blank'>
            <button className='avant-garde-button'>
              {article.get('published') ? 'View' : 'Preview'}
            </button>
          </a>
        </div>

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  channel: state.app.channel,
  edit: state.edit,
  isAdmin: state.app.isAdmin
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditHeader)
