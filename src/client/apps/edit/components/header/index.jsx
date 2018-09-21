import styled from "styled-components"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { connect } from "react-redux"
import {
  deleteArticle,
  publishArticle,
  saveArticle,
} from "client/actions/edit/articleActions"
import { changeView } from "client/actions/edit/editActions"
import Icon from "@artsy/reaction/dist/Components/Icon"
import colors from "@artsy/reaction/dist/Assets/Colors"

export class EditHeader extends Component {
  static propTypes = {
    article: PropTypes.object,
    beforeUnload: PropTypes.func,
    changeViewAction: PropTypes.func,
    channel: PropTypes.object,
    deleteArticleAction: PropTypes.func,
    edit: PropTypes.object,
    forceURL: PropTypes.string,
    isAdmin: PropTypes.bool,
    publishArticleAction: PropTypes.func,
    saveArticleAction: PropTypes.func,
  }

  isPublishable = () => {
    return this.finishedContent() && this.finishedDisplay()
  }

  finishedContent = () => {
    const { title } = this.props.article

    return title && title.length > 0
  }

  finishedDisplay = () => {
    const { thumbnail_image, thumbnail_title } = this.props.article
    const finishedImg = thumbnail_image && thumbnail_image.length > 0
    const finishedTitle = thumbnail_title && thumbnail_title.length > 0

    return finishedImg && finishedTitle
  }

  onPublish = () => {
    const { publishArticleAction } = this.props

    if (this.isPublishable()) {
      publishArticleAction()
    }
  }

  onSave = () => {
    const { saveArticleAction } = this.props

    this.removeUnsavedAlert()
    saveArticleAction()
  }

  onDelete = () => {
    const { deleteArticleAction } = this.props

    if (confirm("Are you sure?")) {
      this.removeUnsavedAlert()
      deleteArticleAction()
    }
  }

  removeUnsavedAlert = () => {
    const { beforeUnload } = this.props
    // dont show popup for unsaved changes when saving/deleting
    window.removeEventListener("beforeunload", beforeUnload)
  }

  getSaveColor = () => {
    const { isSaving, isSaved } = this.props.edit

    if (isSaving) {
      return colors.greenRegular
    } else if (isSaved) {
      return "black"
    } else {
      return colors.redMedium
    }
  }

  getSaveText = () => {
    const { article, edit } = this.props
    const { isSaving } = edit

    if (isSaving) {
      return "Saving..."
    } else if (article.published) {
      return "Save Article"
    } else {
      return "Save Draft"
    }
  }

  getPublishText = () => {
    const { article, edit } = this.props
    const { isPublishing } = edit
    const isPublished = article.published

    if (isPublishing && isPublished) {
      return "Unpublishing..."
    } else if (isPublishing) {
      return "Publishing..."
    } else if (isPublished) {
      return "Unpublish"
    } else {
      return "Publish"
    }
  }

  render() {
    const {
      article,
      changeViewAction,
      channel,
      edit,
      forceURL,
      isAdmin,
    } = this.props
    const { activeView, isDeleting } = edit
    const { grayMedium, greenRegular } = colors

    return (
      <div className="EditHeader">
        <div className="EditHeader__left">
          <div className="EditHeader__tabs">
            <button
              className="avant-garde-button check"
              onClick={() => changeViewAction("content")}
              data-active={activeView === "content"}
            >
              <span>Content</span>
              <Icon
                className="icon"
                name="check"
                color={this.finishedContent() ? greenRegular : grayMedium}
              />
            </button>

            <button
              className="avant-garde-button check"
              onClick={() => changeViewAction("display")}
              data-active={activeView === "display"}
            >
              <span>Display</span>
              <Icon
                className="icon"
                name="check"
                color={this.finishedDisplay() ? greenRegular : grayMedium}
              />
            </button>

            {isAdmin && (
              <button
                className="avant-garde-button"
                onClick={() => changeViewAction("admin")}
                data-active={activeView === "admin"}
              >
                Admin
              </button>
            )}
          </div>

          <div>
            <button
              className="avant-garde-button publish"
              data-disabled={!this.isPublishable()}
              onClick={this.onPublish}
            >
              {this.getPublishText()}
            </button>

            {channel.type === "editorial" && (
              <button className="avant-garde-button autolink">Auto-link</button>
            )}
          </div>
        </div>

        <div className="EditHeader__right">
          <button className="avant-garde-button delete" onClick={this.onDelete}>
            {isDeleting ? "Deleting..." : "Delete"}
          </button>

          <SaveButton
            className="avant-garde-button"
            color={this.getSaveColor()}
            onClick={this.onSave}
          >
            {this.getSaveText()}
          </SaveButton>

          <a href={`${forceURL}/article/${article.slug}`} target="_blank">
            <button className="avant-garde-button">
              {article.published ? "View" : "Preview"}
            </button>
          </a>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
  channel: state.app.channel,
  edit: state.edit,
  forceURL: state.app.forceURL,
  isAdmin: state.app.isAdmin,
})

const mapDispatchToProps = {
  changeViewAction: changeView,
  deleteArticleAction: deleteArticle,
  publishArticleAction: publishArticle,
  saveArticleAction: saveArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditHeader)

const SaveButton = styled.button`
  color: ${props => props.color};
`
