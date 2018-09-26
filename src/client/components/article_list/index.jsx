import PropTypes from "prop-types"
import React, { Component } from "react"
import moment from "moment"
import styled from "styled-components"
import { connect } from "react-redux"
import colors from "@artsy/reaction/dist/Assets/Colors"
import { IconLock } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLock"
import Icon from "@artsy/reaction/dist/Components/Icon"

const IconCheckCircle = styled(Icon)`
  color: ${colors.grayMedium};
  font-size: 30px;

  &:hover {
    color: black;
  }
`

export class ArticleList extends Component {
  static propTypes = {
    activeSessions: PropTypes.object,
    articles: PropTypes.array,
    checkable: PropTypes.bool,
    display: PropTypes.string,
    forceURL: PropTypes.string,
    isArtsyChannel: PropTypes.bool,
    selected: PropTypes.func,
    user: PropTypes.object,
  }

  static defaultProps = {
    activeSessions: {},
  }

  getDisplayAttrs(article) {
    if (this.props.display === "email" && article.email_metadata) {
      return {
        headline: article.email_metadata.headline,
        image: article.email_metadata.image_url,
      }
    } else {
      return {
        headline: article.thumbnail_title,
        image: article.thumbnail_image,
      }
    }
  }

  publishText(result) {
    if (result.published_at && result.published) {
      return `Published ${moment(result.published_at).fromNow()}`
    } else if (result.scheduled_publish_at) {
      return (
        "Scheduled to publish " +
        `${moment(result.scheduled_publish_at).fromNow()}`
      )
    } else {
      return "Last saved " + `${moment(result.updated_at).fromNow()}`
    }
  }

  currentSessionText(article) {
    const session = this.props.activeSessions[article.id]
    return (
      <h2>
        <span>Last saved {moment(session.timestamp).fromNow()}</span>
        <span className="name">
          <span className="circle" /> {session.user.name}
        </span>
      </h2>
    )
  }

  renderArticles() {
    const {
      activeSessions,
      articles,
      checkable,
      forceURL,
      isArtsyChannel,
      user,
    } = this.props

    return articles.map(article => {
      const attrs = this.getDisplayAttrs(article)
      const session = activeSessions[article.id]
      const isCurrentlyBeingEdited = session
      const isCurrentUserEditing =
        user && session && user.id === session.user.id
      const style = isCurrentlyBeingEdited ? { color: colors.grayMedium } : null
      const shouldLockEditing = isCurrentlyBeingEdited && !isCurrentUserEditing
      const lockedClass = shouldLockEditing ? "locked" : ""
      const missingData = `Missing ${isArtsyChannel ? "Magazine" : "Thumbnail"}`

      return (
        <div
          style={style}
          className="article-list__result paginated-list-item"
          key={article.id}
        >
          {checkable && (
            <div
              className="article-list__checkcircle"
              ref={article.id}
              onClick={() => this.props.selected(article)}
            >
              <IconCheckCircle name="follow-circle.is-following" />
            </div>
          )}
          <a
            className={`article-list__article ${lockedClass}`}
            href={`/articles/${article.id}/edit`}
          >
            <div
              className="article-list__image paginated-list-img"
              style={
                attrs.image ? { backgroundImage: `url(${attrs.image})` } : {}
              }
            >
              {!attrs.image && (
                <div className="missing-img">
                  {missingData}
                  <br />
                  Image
                </div>
              )}
            </div>
            <div className="article-list__title paginated-list-text-container">
              {article.layout !== "classic" && <h2>{article.layout}</h2>}
              {attrs.headline ? (
                <h1>{attrs.headline}</h1>
              ) : (
                <h1 className="missing-title">{missingData} Title</h1>
              )}
              {shouldLockEditing ? (
                this.currentSessionText(article)
              ) : (
                <h2>{this.publishText(article)}</h2>
              )}
            </div>
          </a>
          <a
            className={`article-list__preview paginated-list-preview avant-garde-button ${lockedClass}`}
            href={`${forceURL}/article/${article.slug}`}
            target="_blank"
          >
            {shouldLockEditing ? (
              <span>
                <IconLock
                  color={colors.grayMedium}
                  width="10px"
                  height="10px"
                />
                <span className="title">Locked</span>
              </span>
            ) : (
              "View"
            )}
          </a>
        </div>
      )
    })
  }

  render() {
    const articles = this.props.articles || {}

    return (
      <div className="article-list__results">
        {!articles.length ? (
          <div className="article-list__no-results">No Results Found</div>
        ) : (
          this.renderArticles()
        )}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  activeSessions: state.articlesList.articlesInSession || {},
  user: state.app.user,
  forceURL: state.app.forceURL,
})

export default connect(mapStateToProps)(ArticleList)
