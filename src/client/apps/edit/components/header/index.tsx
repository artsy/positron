import { Box, Button, color, Flex, space } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { Tab, Tabs } from "@artsy/reaction/dist/Styleguide/Components/Tabs"
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

const tabs = [
  { name: "Content", type: "content" },
  { name: "Display", type: "display" },
  { name: "Admin", type: "admin" },
]
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
  handleTabChange = tab => {
    this.props.changeViewAction(tab)
  }

  addTabIcon = tab => {
    if (tab.props.children === "Content") {
      return React.cloneElement(tab, tab.props, [
        "Content",
        <CheckIcon
          key="content-check"
          fontSize="10px"
          className="icon"
          name="check"
          color={this.finishedContent() ? "green100" : "black30"}
        />,
      ])
    } else if (tab.props.children === "Display") {
      return React.cloneElement(tab, tab.props, [
        "Display",
        <CheckIcon
          key="display-check"
          fontSize="10px"
          className="icon"
          name="check"
          color={this.finishedDisplay() ? "green100" : "black30"}
        />,
      ])
    } else {
      return tab
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

    const { isDeleting } = edit

    return (
      <Flex justifyContent="space-between" height={50}>
        <Box pt="15px" width="100%">
          <EditTabs
            initialTabIndex={0}
            onChange={activeTab => {
              changeViewAction(activeTab.name.toLowerCase())
            }}
            transformTabBtn={this.addTabIcon}
          >
            <Tab name="Content" />
            <Tab name="Display" />
            {isAdmin && <Tab name="Admin" />}
          </EditTabs>
        </Box>

        <ButtonContainer pr={2}>
          <HeaderButton
            onClick={this.onDelete}
            variant="noOutline"
            size="small"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </HeaderButton>
          {channel.type === "editorial" && (
            <HeaderButton variant="secondaryOutline" ml={1} size="small">
              Auto-link
            </HeaderButton>
          )}
          <HeaderButton
            ml={1}
            variant="secondaryOutline"
            color={this.getSaveColor()}
            onClick={this.onSave}
            size="small"
          >
            {this.getSaveText()}
          </HeaderButton>

          <a href={`${forceURL}/article/${article.slug}`} target="_blank">
            <HeaderButton ml={1} variant="secondaryOutline" size="small">
              {article.published ? "View" : "Preview"}
            </HeaderButton>
          </a>

          <HeaderButton
            ml={1}
            size="small"
            variant="primaryBlack"
            disabled={!this.isPublishable()}
            onClick={this.onPublish}
          >
            {this.getPublishText()}
          </HeaderButton>
        </ButtonContainer>
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

const EditTabs = styled(Tabs)``

const ButtonContainer = styled(Flex)`
  align-items: center;
  height: 100%;
  margin-top: -1px;
  border-bottom: 1px solid ${color("black10")};
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
