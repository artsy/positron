import { Button, Flex, space } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import Tabs from "@artsy/reaction/dist/Styleguide/Components/Tabs"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import {
  deleteArticle,
  publishArticle,
  saveArticle,
} from "../../../../../client/actions/edit/articleActions"
import { changeView } from "../../../../../client/actions/edit/editActions"

interface Props {
  article: ArticleData
  beforeUnload: () => void
  changeViewAction: (e) => void
  channel: Channel
  deleteArticleAction: () => void
  edit: Edit
  forceURL: string
  isAdmin: boolean
  publishArticleAction: () => void
  saveArticleAction: () => void
}

interface Channel {
  id: string
  name: string
  type: string
}

interface Edit {
  activeView: string
  article: ArticleData
  currentSession: object
  error: object
  isDeleting: boolean
  isPublishing: boolean
  isSaved: true
  isSaving: false
  mentioned: object
  section: object
  sectionIndex: number
  setYoastKeyword: string
}

export class EditHeader extends Component<Props> {
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
      return "green100"
    } else if (isSaved) {
      return "black100"
    } else {
      return "red100"
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

    return (
      <Flex justifyContent="space-between" p={1}>
        <Flex>
          <div>
            <HeaderButton
              borderRadius={0}
              variant="secondaryOutline"
              color={activeView === "content" ? "black100" : "black30"}
              onClick={() => changeViewAction("content")}
            >
              <span>Content</span>
              <CheckIcon
                fontSize="10px"
                className="icon"
                name="check"
                color={this.finishedContent() ? "green100" : "black30"}
              />
            </HeaderButton>

            <HeaderButton
              color={activeView === "display" ? "black100" : "black30"}
              borderRadius={0}
              variant="noOutline"
              borderLeft="none"
              borderBottom={
                activeView === "display" ? "2px solid black" : "none"
              }
              onClick={() => changeViewAction("display")}
            >
              <span>Display</span>
              <CheckIcon
                fontSize="10px"
                className="icon"
                name="check"
                color={this.finishedDisplay() ? "green100" : "black30"}
              />
            </HeaderButton>

            {isAdmin && (
              <HeaderButton
                color={activeView === "admin" ? "black100" : "black30"}
                borderRadius={0}
                borderLeft="none"
                mr={1}
                variant="noOutline"
                borderBottom={
                  activeView === "admin" ? "2px solid black" : "none"
                }
                onClick={() => changeViewAction("admin")}
              >
                Admin
              </HeaderButton>
            )}
          </div>

          <div>
            <HeaderButton
              borderRadius={0}
              variant="secondaryOutline"
              disabled={!this.isPublishable()}
              onClick={this.onPublish}
            >
              {this.getPublishText()}
            </HeaderButton>

            {channel.type === "editorial" && (
              <HeaderButton borderRadius={0} ml={1} variant="secondaryOutline">
                Auto-link
              </HeaderButton>
            )}
          </div>
        </Flex>

        <Flex>
          <HeaderButton
            borderRadius={0}
            variant="noOutline"
            onClick={this.onDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </HeaderButton>

          <HeaderButton
            ml={1}
            borderRadius={0}
            variant="secondaryOutline"
            color={this.getSaveColor()}
            onClick={this.onSave}
          >
            {this.getSaveText()}
          </HeaderButton>

          <a href={`${forceURL}/article/${article.slug}`} target="_blank">
            <HeaderButton ml={1} variant="secondaryOutline" borderRadius={0}>
              {article.published ? "View" : "Preview"}
            </HeaderButton>
          </a>
        </Flex>
      </Flex>
    )
  }
}

export interface HeaderButtonProps {
  color?: string
  borderLeft?: string
  borderBottom?: string
}
export const HeaderButton = styled(Button).attrs<HeaderButtonProps>({})`
  background: pink;
`

const CheckIcon = styled(Icon)`
  margin-right: 0;
  margin-left: ${space(1)}px;
`

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
