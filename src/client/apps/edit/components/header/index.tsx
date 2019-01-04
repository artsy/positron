import { Button, color, Flex, space } from "@artsy/palette"
import colors from "@artsy/reaction/dist/Assets/Colors"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"
import Icon from "@artsy/reaction/dist/Components/Icon"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
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
      <EditHeaderContainer>
        <Flex>
          <div>
            <LeftHeaderButton
              variant="secondaryOutline"
              hasCheck
              onClick={() => changeViewAction("content")}
              isActive={activeView === "content"}
            >
              <span>Content</span>
              <CheckIcon
                fontSize="10px"
                className="icon"
                name="check"
                color={this.finishedContent() ? greenRegular : grayMedium}
              />
            </LeftHeaderButton>

            <LeftHeaderButton
              variant="secondaryOutline"
              hasCheck
              onClick={() => changeViewAction("display")}
              isActive={activeView === "display"}
            >
              <span>Display</span>
              <CheckIcon
                fontSize="10px"
                className="icon"
                name="check"
                color={this.finishedDisplay() ? greenRegular : grayMedium}
              />
            </LeftHeaderButton>

            {isAdmin && (
              <LeftHeaderButton
                variant="secondaryOutline"
                onClick={() => changeViewAction("admin")}
                isActive={activeView === "admin"}
              >
                Admin
              </LeftHeaderButton>
            )}
          </div>

          <div>
            <LeftHeaderButton
              variant="secondaryOutline"
              disabled={!this.isPublishable()}
              isDisabled={!this.isPublishable()}
              onClick={this.onPublish}
            >
              {this.getPublishText()}
            </LeftHeaderButton>

            {channel.type === "editorial" && (
              <LeftHeaderButton variant="secondaryOutline">
                Auto-link
              </LeftHeaderButton>
            )}
          </div>
        </Flex>

        <Flex>
          <RightHeaderButton
            variant="secondaryOutline"
            onClick={this.onDelete}
            isDelete
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </RightHeaderButton>

          <SaveButton
            variant="secondaryOutline"
            color={this.getSaveColor()}
            onClick={this.onSave}
          >
            {this.getSaveText()}
          </SaveButton>

          <Link href={`${forceURL}/article/${article.slug}`} target="_blank">
            <RightHeaderButton variant="secondaryOutline">
              {article.published ? "View" : "Preview"}
            </RightHeaderButton>
          </Link>
        </Flex>
      </EditHeaderContainer>
    )
  }
}

const EditHeaderContainer = styled(Flex)`
  justify-content: space-between;
  padding: ${space(1)}px;
`

const HeaderButton = styled(Button)`
  border-radius: 0;
  padding: 11px 18px;
  ${avantgarde("s11")};
  border: 1px solid ${color("black10")};
  background: transparent;
  font-size: 12px;
  outline: none;
  transition: background-color 0.25s, color 0.25s, border-color 0.25s;
  text-decoration: none;
  line-height: 1;
  display: inline-block;
  cursor: pointer;
  margin: 0;
  vertical-align: top;
  text-align: center;
`
const LeftHeaderButton = styled(HeaderButton).attrs<{
  isDisabled?: boolean
  isActive?: boolean
  hasCheck?: boolean
}>({})`
  color: ${props =>
    props.isActive === true || props.isDisabled === false
      ? color("black100")
      : color("black30")};
  background: ${props => (props.isDisabled ? color("black10") : "transparent")};
  margin-right: ${props => (props.hasCheck ? 0 : space(1))}px;
  ${props => props.hasCheck && "border-right: none"};

  &:hover {
    color: ${color("black100")};
  }
`

const RightHeaderButton = styled(HeaderButton).attrs<{
  isDelete?: boolean
}>({})`
  margin-left: ${space(1)}px;
  ${props => props.isDelete && "border: none"};
`

const CheckIcon = styled(Icon)`
  margin-right: 0;
  margin-left: ${space(1)}px;
`
const Link = styled.a`
  background-image: none;
`
const SaveButton = styled(HeaderButton).attrs<{
  color: string
}>({})`
  color: ${props => props.color};
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
