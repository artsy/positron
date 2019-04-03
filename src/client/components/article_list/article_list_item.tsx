import { Button, color, Flex, Sans, Serif, space } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import { IconLock } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLock"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import moment from "moment"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { capitalize } from "underscore.string"

interface ArticleListProps {
  activeSessions: any
  article: ArticleData
  checkable: boolean
  display: string
  forceURL: string
  isArtsyChannel: boolean
  isLoading: boolean
  selected: (article: ArticleData) => void
  user: any
}

export class ArticleListItem extends Component<ArticleListProps> {
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
      <Sans size="3t" weight="medium" color="black30">
        <span>Last saved {moment(session.timestamp).fromNow()}</span>
        <CircleSeparator /> {session.user.name}
      </Sans>
    )
  }

  render() {
    const {
      activeSessions,
      article,
      checkable,
      forceURL,
      isArtsyChannel,
      user,
    } = this.props

    const attrs = this.getDisplayAttrs(article)
    const session = activeSessions[article.id]
    const isCurrentlyBeingEdited = session
    const isCurrentUserEditing = user && session && user.id === session.user.id
    const isLocked = isCurrentlyBeingEdited && !isCurrentUserEditing
    const lockedClass = isLocked ? "locked" : ""
    const missingData = isArtsyChannel ? "Magazine" : "Thumbnail"

    return (
      <ItemContainer justifyContent="space-between" alignItems="center" py={2}>
        {checkable && (
          <CheckCircleContainer onClick={() => this.props.selected(article)}>
            <IconCheckCircle name="follow-circle.is-following" />
          </CheckCircleContainer>
        )}
        <ArticleLink
          className={`article-list__article ${lockedClass}`}
          href={`/articles/${article.id}/edit`}
        >
          <Flex alignItems="center">
            <ArticleImage imageUrl={attrs.image}>
              {!attrs.image && (
                <Flex
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  height="100%"
                >
                  <Sans size="3t" color="black30">
                    Missing
                  </Sans>
                  <Sans size="3t" color="black30">
                    {missingData}
                  </Sans>
                  <Sans size="3t" color="black30">
                    Image
                  </Sans>
                </Flex>
              )}
            </ArticleImage>

            <div>
              {article.layout !== "classic" && (
                <Sans
                  size="3t"
                  weight="medium"
                  color={isLocked ? "black30" : "black10"}
                >
                  {capitalize(article.layout)}
                </Sans>
              )}
              {attrs.headline ? (
                <Serif
                  size="4t"
                  py={0.5}
                  color={isLocked ? "black30" : "black10"}
                >
                  {attrs.headline}
                </Serif>
              ) : (
                <Serif size="4t" color="black30" py={1}>
                  Missing {missingData} Title
                </Serif>
              )}
              {isLocked ? (
                this.currentSessionText(article)
              ) : (
                <Sans size="3t" weight="medium">
                  {this.publishText(article)}
                </Sans>
              )}
            </div>
          </Flex>
        </ArticleLink>

        <Button variant="secondaryOutline" disabled={isLocked}>
          <a href={`${forceURL}/article/${article.slug}`} target="_blank">
            {isLocked ? (
              <LockedText>
                <IconLock width="10px" height="10px" />
                Locked
              </LockedText>
            ) : (
              "View"
            )}
          </a>
        </Button>
      </ItemContainer>
    )
  }
}

export const ArticleListContainer = styled.div``

const ArticleLink = styled.a`
  flex: 1;
  padding-right: ${space(2)}px;
`

const ItemContainer = styled(Flex)`
  cursor: default;
  border-bottom: 1px solid ${color("black10")};

  button {
    align-self: center;
  }

  a {
    text-decoration: none;
  }
`

const ArticleImage = styled.div<{ imageUrl?: string }>`
  background-color: ${color("black10")};
  margin-right: ${space(2)}px;
  width: 145px;
  height: 90px;

  ${props =>
    props.imageUrl &&
    `
    background: url(${props.imageUrl});
    background-size: cover;
    background-positon: center;
  `};
`

const CircleSeparator = styled.span`
  display: inline-block;
  content: "";
  width: 8px;
  height: 8px;
  margin: 0 12px;
  margin-bottom: 1px;
  background: ${color("black30")};
  border-radius: 50%;
`

const LockedText = styled.span`
  svg {
    margin-right: 5px;
  }
`

const CheckCircleContainer = styled.div`
  width: 18px;
  height: 18px;
  display: inline-block;
  margin-right: ${space(2)}px;
  vertical-align: middle;
  cursor: pointer;
  color: ${color("black30")};

  &:hover {
    color: ${color("black100")};
  }

  div {
    margin-left: 0;
  }
`

const IconCheckCircle = styled(Icon)`
  color: ${color("black30")};
  font-size: 30px;

  &:hover {
    color: black;
  }
`

const mapStateToProps = state => ({
  activeSessions: state.articlesList.articlesInSession || {},
  user: state.app.user,
  forceURL: state.app.forceURL,
})

export default connect(mapStateToProps)(ArticleListItem)
