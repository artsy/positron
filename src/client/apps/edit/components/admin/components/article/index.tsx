import {
  Box,
  Button as SystemButton,
  Checkbox,
  color,
  Flex,
  Sans,
  SansProps,
  Theme,
} from "@artsy/palette"
import { clone, uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import { ArticleData } from "reaction/Components/Publishing/Typings"
import styled from "styled-components"
import request from "superagent"
import { difference, flatten, pluck } from "underscore"

import { onChangeArticle } from "client/actions/edit/articleActions"
import { AutocompleteList } from "client/components/autocomplete2/list"
import { RelatedArticleQuery } from "client/queries/related_articles"
import ArticleAuthors from "./article_authors"
import { ArticlePublishDate, InputGroup } from "./article_publish_date"
import { ArticleVideoReleaseDate } from "./article_video_release_date"

export interface AdminArticleProps {
  article: ArticleData
  apiURL: string
  isEditorial: boolean
  onChangeArticleAction: (key: string, value: any) => void
  user: any
}

interface AdminArticleState {
  min: number
  sec: number
  videoDurationHasFocus: boolean
}

export const SansLabelProps: SansProps = {
  size: "3t",
  weight: "medium",
}

export class AdminArticle extends Component<
  AdminArticleProps,
  AdminArticleState
> {
  constructor(props) {
    super(props)

    const {
      article: { media },
    } = this.props
    const duration = (media || {}).duration || 0

    this.state = {
      min: Math.floor(Math.round(duration) / 60),
      sec: Math.round(duration) % 60,
      videoDurationHasFocus: false,
    }
  }

  fetchArticles = (fetchedItems, cb) => {
    const { apiURL, article, user } = this.props
    const { related_article_ids } = article

    const alreadyFetched = pluck(fetchedItems, "id")
    const idsToFetch = difference(related_article_ids, alreadyFetched)
    const newItems = clone(fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${apiURL}/graphql`)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: RelatedArticleQuery(idsToFetch) })
        .end((err, res) => {
          if (err) {
            new Error(err)
          }
          newItems.push(res.body.data.articles)
          const uniqItems = uniq(flatten(newItems))
          cb(uniqItems)
        })
    } else {
      return fetchedItems
    }
  }

  onMediaChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const media = clone(article.media) || {}

    media[key] = value
    onChangeArticleAction("media", media)
  }

  onVideoDurationMinUpdated = event => {
    this.setState({ min: event.target.value }, () => {
      this.onMediaChange("duration", this.state.min * 60 + this.state.sec)
    })
  }

  onVideoDurationSecondUpdated = event => {
    this.setState({ sec: event.target.value }, () => {
      this.onMediaChange("duration", this.state.min * 60 + this.state.sec)
    })
  }

  render() {
    const { article, apiURL, isEditorial, onChangeArticleAction } = this.props
    const { min, sec, videoDurationHasFocus } = this.state
    const canToggleLayout =
      article.layout === "standard" || article.layout === "feature"

    return (
      <Theme>
        <div>
          <ArticleAuthors />

          <Flex flexDirection={["column", "row"]}>
            <Box width={["100%", "50%"]} pr={[0, 20]} pb={40}>
              {article.layout !== "news" && (
                <Flex flexDirection={["column", "row"]}>
                  <Box width={["100%", "50%"]} pb={40} pr={[0, 20]}>
                    <Sans {...SansLabelProps}>Article Tier</Sans>
                    <ButtonGroup>
                      <Button
                        color={article.tier === 1 ? "black100" : "black10"}
                        onClick={() => onChangeArticleAction("tier", 1)}
                        variant="noOutline"
                      >
                        Tier 1
                      </Button>
                      <Button
                        color={article.tier === 2 ? "black100" : "black10"}
                        onClick={() => onChangeArticleAction("tier", 2)}
                        variant="noOutline"
                      >
                        Tier 2
                      </Button>
                    </ButtonGroup>
                  </Box>

                  <Box width={["100%", "50%"]} pb={40} pl={[0, 20]}>
                    <Sans {...SansLabelProps}>Magazine Feed</Sans>
                    <ButtonGroup>
                      <Button
                        color={article.featured ? "black100" : "black10"}
                        onClick={() => onChangeArticleAction("featured", true)}
                        variant="noOutline"
                      >
                        Yes
                      </Button>
                      <Button
                        color={!article.featured ? "black100" : "black10"}
                        onClick={() => onChangeArticleAction("featured", false)}
                        variant="noOutline"
                      >
                        No
                      </Button>
                    </ButtonGroup>
                  </Box>
                </Flex>
              )}

              <Flex pb={40}>
                {isEditorial &&
                  canToggleLayout && (
                    <Box width={["100%", "50%"]} pr={[0, 20]}>
                      <Sans {...SansLabelProps}>Article Layout</Sans>
                      <ButtonGroup>
                        <Button
                          variant="noOutline"
                          onClick={() =>
                            onChangeArticleAction("layout", "standard")
                          }
                          color={
                            article.layout === "standard"
                              ? "black100"
                              : "black10"
                          }
                        >
                          Standard
                        </Button>
                        <Button
                          variant="noOutline"
                          color={
                            article.layout === "feature"
                              ? "black100"
                              : "black10"
                          }
                          onClick={() =>
                            onChangeArticleAction("layout", "feature")
                          }
                        >
                          Feature
                        </Button>
                      </ButtonGroup>
                    </Box>
                  )}

                {article.layout === "video" && (
                  <Box width={["100%", "50%"]}>
                    <Sans {...SansLabelProps}>Video duration</Sans>

                    <InputGroup
                      mt={0.5}
                      mr={4}
                      pr={2}
                      flexDirection="row"
                      alignItems="center"
                      hasFocus={videoDurationHasFocus}
                      onClick={() =>
                        this.setState({ videoDurationHasFocus: true })
                      }
                    >
                      <input
                        className="bordered-input"
                        type="number"
                        min="00"
                        max="99"
                        step="1"
                        placeholder="00"
                        defaultValue={min.toString()}
                        onChange={this.onVideoDurationMinUpdated}
                        onBlur={() =>
                          this.setState({ videoDurationHasFocus: false })
                        }
                      />
                      min
                      <input
                        className="bordered-input"
                        type="number"
                        min="00"
                        max="60"
                        step="1"
                        placeholder="00"
                        defaultValue={sec.toString()}
                        onChange={this.onVideoDurationSecondUpdated}
                        onBlur={() =>
                          this.setState({ videoDurationHasFocus: false })
                        }
                      />
                      sec
                    </InputGroup>
                  </Box>
                )}
              </Flex>

              <Checkbox
                selected={article.indexable}
                onSelect={() =>
                  onChangeArticleAction("indexable", !article.indexable)
                }
              >
                <Sans {...SansLabelProps}>Index for search</Sans>
              </Checkbox>

              <Checkbox
                selected={article.exclude_google_news}
                onSelect={() =>
                  onChangeArticleAction(
                    "exclude_google_news",
                    !article.exclude_google_news
                  )
                }
              >
                <Sans {...SansLabelProps}>Exclude from Google News</Sans>
              </Checkbox>

              {article.layout === "video" && (
                <Checkbox
                  selected={article.media.published}
                  onSelect={() =>
                    this.onMediaChange("published", !article.media.published)
                  }
                >
                  <Sans {...SansLabelProps}>Video Published</Sans>
                </Checkbox>
              )}
            </Box>

            <Box width={["100%", "50%"]} pb={40} pl={[0, 20]}>
              <ArticlePublishDate
                article={article}
                onChange={onChangeArticleAction}
              />

              {article.layout === "video" && (
                <ArticleVideoReleaseDate
                  article={article}
                  onChangeArticleAction={onChangeArticleAction}
                />
              )}

              <Box pb={40}>
                <AutocompleteList
                  label="Related Articles"
                  fetchItems={this.fetchArticles}
                  items={article.related_article_ids || []}
                  onSelect={results =>
                    onChangeArticleAction("related_article_ids", results)
                  }
                  placeholder="Search by title..."
                  url={`${apiURL}/articles?q=%QUERY`}
                />
              </Box>
            </Box>
          </Flex>
        </div>
      </Theme>
    )
  }
}

const mapStateToProps = state => ({
  apiURL: state.app.apiURL,
  article: state.edit.article,
  isEditorial: state.app.isEditorial,
  user: state.app.user,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminArticle)

const Button = styled(SystemButton).attrs<{
  color?: string
}>({})`
  color: ${props => props.color};
`

const ButtonGroup = styled(Flex)`
  margin-top: 10px;
  border: 1px solid ${color("black10")};
  border-radius: 3px;

  button {
    width: 100%;
    outline: none;
    &:first-child {
      border-right: 1px solid ${color("black10")};
    }
  }
`
