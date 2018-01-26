import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'react-redux'
import { data as sd } from 'sharify'
import colors from '@artsy/reaction-force/dist/Assets/Colors'
import $ from 'jquery'

const icons = () => require('./icons.jade')(...arguments)

export class ArticleList extends Component {
  static propTypes = {
    display: PropTypes.string,
    checkable: PropTypes.bool,
    articles: PropTypes.array,
    selected: PropTypes.func,
    activeSessions: PropTypes.object,
    user: PropTypes.object
  }
  getDisplayAttrs (article) {
    if ((this.props.display === 'email') && article.email_metadata) {
      return {
        headline: article.email_metadata.headline,
        image: article.email_metadata.image_url
      }
    } else {
      return {
        headline: article.thumbnail_title,
        image: article.thumbnail_image
      }
    }
  }

  publishText (result) {
    if (result.published_at && result.published) {
      return `Published ${moment(result.published_at).fromNow()}`
    } else if (result.scheduled_publish_at) {
      return 'Scheduled to publish ' +
        `${moment(result.scheduled_publish_at).fromNow()}`
    } else {
      return 'Last saved ' +
        `${moment(result.updated_at).fromNow()}`
    }
  }

  currentSessionText (article) {
    const session = this.props.activeSessions[article.id]
    return (
      <h2>
        <span>Last saved {moment(session.timestamp).fromNow()}</span>
        <span className='name'>● {session.user.name}</span>
      </h2>
    )
  }

  renderArticles () {
    const { checkable, articles, activeSessions, user } = this.props
    return articles.map(article => {
      const attrs = this.getDisplayAttrs(article)
      const session = activeSessions[article.id]
      const isCurrentlyBeingEdited = session
      const isCurrentUserEditing = user && session && user.id === session.user.id
      const style = isCurrentlyBeingEdited ? {color: colors.grayMedium} : null
      const lockedClass = isCurrentlyBeingEdited ? 'locked' : ''

      return (
        <div style={style} className='article-list__result paginated-list-item' key={article.id}>
          {checkable
            ? <div
                className='article-list__checkcircle'
                ref={article.id}
                dangerouslySetInnerHTML={{__html: $(icons()).filter('.check-circle').html()}}
                onClick={() => this.props.selected(article)}
              />
            : null}
          <a className={`article-list__article ${lockedClass}`}
            href={isCurrentlyBeingEdited ? '' : `/articles/${article.id}/edit`}
            disabled={isCurrentlyBeingEdited}>
            <div className='article-list__image paginated-list-img'
              style={attrs.image ? {backgroundImage: `url(${attrs.image})`} : {}}>
              {!attrs.image ? <div className='missing-img'>Missing thumbnail</div> : null}
            </div>
            <div className='article-list__title paginated-list-text-container'>
              {attrs.headline
                ? <h1>{attrs.headline}</h1>
                : <h1 className='missing-title'>Missing Title</h1>
              }

              {isCurrentlyBeingEdited
                ? this.currentSessionText(article)
                : <h2>{this.publishText(article)}</h2>
              }
            </div>
          </a>
          <a className={`article-list__preview paginated-list-preview avant-garde-button ${lockedClass}`}
            href={`${sd.FORCE_URL}/article/${article.slug}`}
            disabled={isCurrentlyBeingEdited}
            target='_blank'>

            {isCurrentlyBeingEdited
            ? <span>
                <span className='lock' />
                <span className='title'>Locked</span>
              </span>
              : 'Preview'}
          </a>
        </div>
      )
    })
  }

  render () {
    return (
      <div className='article-list__results'>
        {!this.props.articles.length
          ? <div className='article-list__no-results'>No Results Found</div>
          : this.renderArticles()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  activeSessions: state.articlesList.articlesInSession || {},
  user: state.app.user
})

export default connect(mapStateToProps)(ArticleList)
